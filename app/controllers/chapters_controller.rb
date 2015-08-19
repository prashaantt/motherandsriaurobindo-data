class ChaptersController < ApplicationController
  def new
    @chapter = Chapter.new
  end

  def create
    @chapter = Chapter.new(chapter_params)
  end

  def show
    respond_to do |format|
      format.html {
        unless params['_escaped_fragment_'].nil?
          @data = get_chapter(params[:compilation], params[:volume], params[:url])
        end
      }
      format.json {
        chapter = get_chapter(params[:compilation], params[:volume], params[:url])
        render json: chapter 
      }
    end
  end

  def index
    result = find_chapter(params)
    chapter = result[:chapter].attributes.select{|attr| ["t", "dt", "desc", "txt"].include? attr}
    render json: chapter
  end

  def update
    result = find_chapter(params)
    diff = {}

    txt = result[:chapter].txt
    txt_updated = params[:chapter][:txt].strip rescue nil
    unless txt === txt_updated
      diff[:txt] = Diffy::Diff.new(txt, txt_updated, :context => 0).to_s(:html)
    end

    desc = result[:chapter].desc
    desc_updated = params[:chapter][:desc].strip rescue nil
    unless desc === desc_updated
      diff[:desc] = Diffy::Diff.new(desc, desc_updated, :context => 0).to_s(:html)
    end

    dt = Date.parse(result[:chapter].dt) rescue nil
    dt_updated = Date.parse(params[:chapter][:dt]) rescue nil
    unless dt_updated === dt
      diff[:dt] = Diffy::Diff.new(dt, dt_updated, :context => 0).to_s(:html)
    end

    audit = {}
    audit[:diff] = diff
    audit[:user] = current_user.uid
    audit[:type] = result[:chapter].class.to_s
    audit[:url] = result[:chapter].url
    audit[:oid] = Hash.new.tap do |oid|
      oid[:bid] = params[:bid] if params[:bid]
      oid[:pid] = params[:pid] if params[:pid]
      oid[:sid] = params[:sid] if params[:sid]
      oid[:suid] = params[:suid] if params[:suid]
      oid[:cid] = params[:cid] if params[:cid]
    end

    Audit.create(audit)

    result[:chapter].assign_attributes(chapter_params)
    result[:volume].update
    render nothing: true
  end

  private

  def find_chapter params
    if params[:bid]
      vol = Volume.where('books._id' => BSON::ObjectId.from_string(params[:bid])).first
      book = vol.books.detect { |b| b.id.to_s == params[:bid] }
      if book.parts?
        part = book.parts.detect { |p| p.id.to_s == params[:pid] }
        if part.chapters?
          chapter = part.chapters.detect { |c| c.id.to_s == params[:cid] }
        elsif part.sections?
          section = part.sections.detect { |s| s.id.to_s == params[:sid] }
          if section.subsections?
            subsection = section.subsections.detect { |su| su.id.to_s == params[:suid] }
            chapter = subsection.chapters.detect { |c| c.id.to_s == params[:cid] }
          elsif section.chapters?
            chapter = section.chapters.detect { |c| c.id.to_s == params[:cid] }
          end
        end
      elsif book.chapters?
        chapter = book.chapters.detect { |c| c.id.to_s == params[:cid] }
      end
    elsif params[:pid]
      vol = Volume.where('parts._id' => BSON::ObjectId.from_string(params[:pid])).first
      part = vol.parts.detect { |p| p.id.to_s == params[:pid] }
      if part.chapters?
        chapter = part.chapters.detect { |c| c.id.to_s == params[:cid] }
      elsif part.sections?
        section = part.sections.detect { |s| s.id.to_s == params[:sid] }
        if section.subsections?
          subsection = section.subsections.detect { |su| su.id.to_s == params[:suid] }
          chapter = subsection.chapters.detect { |c| c.id.to_s == params[:cid] }
        elsif section.chapters?
          chapter = section.chapters.detect { |c| c.id.to_s == params[:cid] }
        end
      end
    end
    {
      chapter: chapter,
      volume: vol
    }
  end

  def get_chapter(compilation, volume, url)
    volume = Volume.where(comp: compilation, vol: volume)
    found = false
    chapter = nil
    if volume.exists?
      chapters_query = { 'chapters._slugs' => url }
      parts_chapters_query = { 'parts.chapters._slugs' => url }
      books_parts_chapters_query = { 'books.parts.chapters._slugs' => url }
      books_chapters_query = { 'books.chapters._slugs' => url }
      books_parts_sections_chapters_query = { 'books.parts.sections.chapters._slugs' => url }
      parts_sections_chapters_query = { 'parts.sections.chapters._slugs' => url }
      books_parts_sections_subsections_chapters_query = { 'books.parts.sections.subsections.chapters._slugs' => url }
      parts_sections_subsections_chapters_query = { 'parts.sections.subsections.chapters._slugs' => url }

      meta = {}

      if (result = volume.where(parts_chapters_query)).exists?
        result.first.parts.each do |p|
          chapter = p.chapters.find(url)
          next if chapter.nil?
          meta[:pid] = p.id.to_s
          meta[:cid] = chapter.id.to_s
          break
        end
      elsif (result = volume.where(parts_sections_chapters_query)).exists?
        result.first.parts.each do |p|
          p.sections.each do |s|
            chapter = s.chapters.find(url)
            next if chapter.nil?
            meta[:sid] = s.id.to_s
            meta[:cid] = chapter.id.to_s
            break
          end
          next if chapter.nil?
          meta[:pid] = p.id.to_s
          break
        end
      elsif (result = volume.where(books_parts_sections_chapters_query)).exists?
        result.first.books.each do |b|
          b.parts.each do |p|
            p.sections.each do |s|
              chapter = s.chapters.find(url)
              next if chapter.nil?
              meta[:sid] = s.id.to_s
              meta[:cid] = chapter.id.to_s
              break
            end
            next if chapter.nil?
            meta[:pid] = p.id.to_s
            break
          end
          next if chapter.nil?
          meta[:bid] = b.id.to_s
          break
        end
      elsif (result = volume.where(books_parts_chapters_query)).exists?
        result.first.books.each do |b|
          b.parts.each do |p|
            chapter = p.chapters.find(url)
            next if chapter.nil?
            meta[:pid] = p.id.to_s
            meta[:cid] = chapter.id.to_s
            break
          end
          next if chapter.nil?
          meta[:bid] = b.id.to_s
          break
        end
      elsif (result = volume.where(books_chapters_query)).exists?
        result.first.books.each do |b|
          chapter = b.chapters.find(url)
          next if chapter.nil?
          meta[:bid] = b.id.to_s
          meta[:cid] = chapter.id.to_s
          break
        end
      elsif (result = volume.where(chapters_query)).exists?
        chapter = result.first.chapters.find(url)
        meta[:cid] = chapter.id.to_s
      elsif (result = volume.where(books_parts_sections_subsections_chapters_query)).exists?
        result.first.books.each do |b|
          b.parts.each do |p|
            p.sections.each do |s|
              s.subsections.each do |subs|
                chapter = subs.chapters.find(url)
                next if chapter.nil?
                meta[:suid] = subs.id.to_s
                meta[:cid] = chapter.id.to_s
                break
              end
              next if chapter.nil?
              meta[:sid] = s.id.to_s
              break
            end
            next if chapter.nil?
            meta[:pid] = p.id.to_s
            break
          end
          next if chapter.nil?
          meta[:bid] = b.id.to_s
          break
        end
      elsif (result = volume.where(parts_sections_subsections_chapters_query)).exists?
        result.first.parts.each do |p|
          p.sections.each do |s|
            s.subsections.each do |subs|
              chapter = subs.chapters.find(url)
              next if chapter.nil?
              meta[:suid] = subs.id.to_s
              meta[:cid] = chapter.id.to_s
              break
            end
            next if chapter.nil?
            meta[:sid] = s.id.to_s
            break
          end
          next if chapter.nil?
          meta[:pid] = p.id.to_s
          break
        end
      end
      if admin_user
        chapter[:meta] = meta
      end
      chapter
    end
  end

  def chapter_params
    params.require(:chapter).permit(:title, :subtitle, :txt, :dt, :desc)
  end
end
