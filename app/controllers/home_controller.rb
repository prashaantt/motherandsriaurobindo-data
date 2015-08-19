class HomeController < ApplicationController
  def index
    gon.dataEndpoint = 'home'
    respond_to do |format|
      format.html do
        unless params['_escaped_fragment_'].nil?
          @data = {}
        end
      end
      format.json do
        render json: {}
      end
    end
  end
end
