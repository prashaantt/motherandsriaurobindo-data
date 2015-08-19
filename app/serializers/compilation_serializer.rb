class CompilationSerializer < ActiveModel::Serializer
  def attributes
    comp = super
    object.attributes.each do |obj|
      comp[obj[0]] = obj[1]
    end
    comp.delete('conc')
    comp
  end
end
