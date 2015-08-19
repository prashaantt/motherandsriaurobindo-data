class Chapter
  require 'redcarpet/render_strip'
  attr_accessor :bid, :pid, :sid, :suid, :cid

  include Mongoid::Document
  include Mongoid::Slug

  field :chap, as: :chapter
  field :t, as: :title
  field :alt, as: :alt_title
  field :subt, as: :subtitle
  field :desc, as: :description
  field :no, type: Integer
  field :ordr, as: :order, type: Integer
  field :dt, as: :date
  field :dto, as: :date_obj, type: Date
  field :yr, as: :year, type: Integer
  field :mo, as: :month, type: Integer
  field :dts, as: :date_start, type: Integer
  field :dte, as: :date_end, type: Integer
  field :mts, as: :month_start, type: Integer
  field :mte, as: :month_end, type: Integer
  field :yrs, as: :year_start, type: Integer
  field :yre, as: :year_end, type: Integer
  field :loc, as: :location
  field :mot, as: :motto, type: String # for Life Divine
  field :txt
  field :exc, as: :excerpt
  field :type
  field :path, type: Array
  field :url
  slug :t
  field :prvt
  field :prvu
  field :nxtt
  field :nxtu
  field :conc, as: :concordance, type: Hash

  embedded_in :readable, polymorphic: true

  embeds_many :segments, cascade_callbacks: true
  embeds_many :items, as: :itemised, cascade_callbacks: true

  def text(*args)
    if args.length == 0
      raw = false
    else
      raw = args[0]
    end
    text = ''
    if txt
      text = txt
    elsif items.length > 0
      text = get_items(items, false, raw)
    elsif segments.length > 0
      text = get_segments(segments, raw)
    end
    text
  end

  def get_concordance
    parser = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
    words = parser.render(self.text(true)).gsub(/\[\^\d\]|\[\^\d\]:|\(|\)/, '').gsub(/\n|—/, ' ').
      gsub(/[^0-9 A-Z\'’a-z\-À-ü]/, '').downcase.split(' ').reject { |w| /\d|^\d+.\d+$/.match(w) }
    frequency = Hash.new(0)
    # words.each { |word| frequency[word] += 1 }
    words.each do |word|
      if (!%w('twas ’twas 'tis ’tis).include?(word))
        # matchSingleQuoted = /^['|’](.*)['|’]?$|(.*)['|’]?$/.match(word)
        # word = matchSingleQuoted.nil? ? word : matchSingleQuoted.captures[0]
        # word = word.gsub(/'|’/, '').strip
        word = word.start_with?("'", "’") ? word[1, word.length - 1] : word
        word = word.end_with?("'", "’") ? word[0, word.length - 1] : word
      end
      frequency[word] += 1
    end
    # Hash[frequency.sort]
    frequency
  end

  private

  def get_segments(segments, raw)
    segment_txt = ''
    new_para = "\n\n"
    segments.each_with_index do |segment, i|
      segment_txt += new_para + '---' if i > 0 && !raw
      segment_txt += new_para + '## ' + segment.t if segment.t && !raw
      segment_txt += new_para + '### ' + segment.subt if segment.subt && !raw
      segment_txt += get_items(segment.items, true, raw)
    end
    segment_txt
  end

  def get_items(items, hasSegments, raw)
    item_txt = ''
    new_para = "\n\n"
    items.each_with_index do |item, i|
      item_txt += new_para + '---' if i > 0 && !raw
      if item.t && !raw
        item_txt += new_para if i > 0
        if hasSegments
          item_txt += new_para + '#### ' + item.t
        else
          item_txt += '## ' + item.t
        end
      end
      if item.subt && !raw
        item_txt += new_para if i > 0 || item.t
        if hasSegments && !raw
          item_txt += new_para + '##### ' + item.subt
        else
          item_txt += '### ' + item.subt
        end
      end
      item_txt += !raw ? new_para + item.txt : item.txt
    end
    item_txt
  end

  
end
