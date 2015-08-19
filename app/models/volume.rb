class Volume
  include Mongoid::Document

  field :t, as: :title
  field :alt, as: :alt_title
  field :subt, as: :subtitle
  field :autn, as: :author_name
  field :auth, as: :author
  field :cmpn, as: :compilation_name
  field :comp, as: :compilation
  field :cmpa, as: :compilation_name_alt
  field :vol, type: Integer
  field :desc
  field :curl, as: :compilation_url
  field :prvt
  field :prvu
  field :prvv, type: Integer
  field :nxtt
  field :nxtu
  field :nxtv, type: Integer
  field :toc, type: Hash
  $alias = {
    'section' => 'sec',
    'subsection' => 'subs',
    'chapter' => 'chap',
    'segment' => 'seg'
  }
  field :conc, as: :concordance, type: Array

  validates_uniqueness_of :vol, scope: [:compilation]

  embeds_many :books, cascade_callbacks: true
  embeds_many :parts, as: :partable, cascade_callbacks: true
  embeds_many :chapters, as: :readable, cascade_callbacks: true

  index({ comp: 1, vol: 1 }, { unique: true })
  index({ comp: 1, vol: 1, "chapters._slugs" => 1 }, { unique: true, sparse: true })
  index({ comp: 1, vol: 1, "books.chapters._slugs" => 1 }, { unique: true, sparse: true })
  index({ comp: 1, vol: 1, "parts.chapters._slugs" => 1 }, { unique: true, sparse: true })

  after_create :set_toc

  private

  def set_toc(*args)
    set_conc = false
    obj = nil
    o = {}
    if args == []
      $conc = {} if set_conc
      obj = self
      $slugs = Set.new
      $duplicate_slugs = {}
      $curr = nil
    else
      obj = args[0]
      obj_alias = $alias[obj.class.to_s.downcase] || obj.class.to_s.downcase

      o[obj_alias + 't'] = obj.t || ''
      o[obj_alias] = obj.send(obj.class.to_s.downcase)
      o.delete(obj_alias) if o[obj_alias].nil?

      if obj.class == Chapter
        dedup_slugs(obj)
        set_chapter_path(obj)
        if set_conc
          obj.conc = obj.get_concordance
          $conc.merge!(obj.conc) {|key, old, new| old + new} if obj.conc
        end
        o['u'] = obj._slugs[0]
        unless $curr.nil?
          obj.prvt = $curr.t
          obj.prvu = $curr.url
          $curr.nxtt = obj.t
          $curr.nxtu = obj.url
        end
        $curr = obj
      elsif obj.class == Item || obj.class == Segment
        if obj.t
          chap = obj
          chap = chap._parent while chap.class != Chapter
          o['u'] = chap._slugs[0] + '#' + obj.t.parameterize
        end
      end
    end

    obj.embedded_relations.each do |e|
      obj.send(e[0]).each do |em|
        unless o[e[0]]
          o[e[0]] = []
        end
        o[e[0]].push(set_toc(em))
      end
    end
    if obj.class == Volume
      obj.toc = o
      obj.conc = alphabetize(Hash[$conc.sort]).sort_by{|alpha| alpha[:a]} if set_conc
      save
    else
      o
    end
  end

  def set_chapter_path(c)
    path = []
    url = c._slugs[0]
    obj = c
    while obj.class != Volume
      obj = obj._parent
      unless obj.nil? || obj.t.nil?
        if obj.class == Volume
          path.push({ :t => obj.alt.nil? ? obj.t : obj.alt, :u => '/' + obj.comp + '/' + obj.vol.to_s.rjust(2, '0') })
          path.push({ :t => obj.cmpa.nil? ? obj.comp : obj.cmpa, :u => '/' + obj.comp })
          c.url = '/' + obj.comp + '/' + obj.vol.to_s.rjust(2, '0') + '/' + url
        else
          path.push({ :t => obj.t })
        end
      end
    end
    c.path = path.reverse
  end

  def dedup_slugs(c)
    slug = c._slugs[0]
    result = $slugs.add?(slug)
    if result.nil?
      if !$duplicate_slugs[slug].nil?
        new_dup = $duplicate_slugs[slug] + 1
        new_slug = slug + '-' + new_dup.to_s
        # slugs.add?
        $slugs.add(slug)
        c._slugs[0] = new_slug
        $duplicate_slugs[slug] = new_dup
      else
        split = slug.split('-')
        # if split[split.length - 1].to_i != 0
        $duplicate_slugs[slug] = 1
        new_slug = slug + '-1'
        c._slugs[0] = new_slug
        $slugs.add(slug)
      end
    end
  end

  def alphabetize(sorted_words_list)
    words_list = []
    sorted_words_list.each do |word_count_array|
      word = word_count_array[0].gsub(/^'|’/, '')
      unless word[0].nil?
        alpha = word[0].mb_chars.normalize(:kd).gsub(/[^\x00-\x7F]/n,'').to_s
        alpha = /^[a-z]/.match(alpha) ? alpha : '&'
        entry = {w: word_count_array[0], n: word_count_array[1]}
        found = false
        unless words_list.empty?
          words_list.each do |word|
            if word[:a] === alpha
              word[:w].push(entry)
              found = true
              break
            end
          end
        end
        if !found
          words_list.push({a: alpha, w: [entry]})
        end
      end
    end
    words_list
  end
end
