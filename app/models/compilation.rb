class Compilation
  include Mongoid::Document

  field :cmpn, as: :compilation_name
  field :comp, as: :compilation
  field :autn, as: :author_name
  field :auth, as: :author
  field :desc
  field :curl, as: :compilation_url
  field :vols, as: :volumes, type: Array
  field :conc, as: :concordance, type: Array

  before_save :set_vols

  def set_vols
    result = Volume.where(comp: self.comp)
    conc = []
    set_conc = false
    if result.count.to_i > 0
      vols = []
      currVolume = nil
      result.asc(:vol).each do |volume|
        vol = {}
        unless currVolume.nil?
          volume.prvt = currVolume.alt ? currVolume.alt : currVolume.t
          volume.prvu = self.comp.to_s + '/' + currVolume.vol.to_s.rjust(2, '0')
          volume.prvv = currVolume.vol
          currVolume.nxtt = volume.alt ? volume.alt : volume.t
          currVolume.nxtu = self.comp.to_s + '/' + volume.vol.to_s.rjust(2, '0')
          currVolume.nxtv = volume.vol
          currVolume.save
          if set_conc
            if conc.empty?
              conc = currVolume.conc unless currVolume.conc.nil?
            elsif !currVolume.conc.nil?
              currVolume.conc.each do |alpha|
                conc.each do |comp_alpha|
                  if comp_alpha[:a] === alpha[:a]
                    comp_alpha[:w].concat(alpha[:w])
                    comp_alpha[:w].sort_by!{|word| word[:w]}
                    comp_alpha[:w].each_with_index do |word, i|
                      if i < comp_alpha[:w].length - 1 && word[:w] === comp_alpha[:w][i + 1][:w]
                        word[:n] += comp_alpha[:w][i + 1][:n]
                        comp_alpha[:w].delete_at(i + 1)
                      end
                    end
                    break
                  end
                end
              end
            end
          end
        end
        currVolume = volume
        vol[:vol] = volume.vol.to_s.rjust(2, '0')
        vol[:t] = volume.alt ? volume.alt : volume.t
        vol[:url] = volume.comp + '/' + vol[:vol]
        vols.push(vol)
      end
      currVolume.save
      self.vols = vols
      self.conc = conc if set_conc
    end
  end
end
