class AuthorsController < ApplicationController
  def show
    respond_to do |format|
      format.html do
        unless params['_escaped_fragment_'].nil?
          @data = get_author(params[:author])
        end
      end
      format.json do
        author = get_author(params[:author])
        render json: author
      end
    end
  end

  private

  def get_author(author)
    Author.find_by(auth: author)
  end
end
