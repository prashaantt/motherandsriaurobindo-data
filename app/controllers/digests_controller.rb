class DigestsController < ApplicationController
  def get
    asset = params['asset']
    # if Rails.env.production?
    digest = Rails.application.assets.find_asset(asset).digest rescue ''
    # else
    #   digest = ''
    # end
    respond_to do |format|
      format.json {
        render json: {'digest' => digest}
      }
    end
  end
end
