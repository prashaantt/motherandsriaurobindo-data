class DoclistController < ApplicationController
  def index
    if params[:a] == 'm' || params[:a] == 'sa'
      @chapters = Book.find_by(author_code: params[:a]).chapters
    end
  end
end
