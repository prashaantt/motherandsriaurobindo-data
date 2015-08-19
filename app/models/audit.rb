class Audit
  include Mongoid::Document
  include Mongoid::Timestamps::Created

  field :type
  field :oid, type: Hash
  field :diff, type: Hash
  field :url
  field :user
end
