class VolumeSerializer < ActiveModel::Serializer
  include ActionView::Helpers::AssetUrlHelper
  def attributes
    volume = super
    object.attributes.each do |attr|
      volume[attr[0]] = attr[1]
    end
    volume.delete('conc')
    volume['prvu'] = root_path + object.prvu unless object.prvu.nil?
    volume['nxtu'] = root_path + object.nxtu unless object.nxtu.nil?
    volume
  end
end
