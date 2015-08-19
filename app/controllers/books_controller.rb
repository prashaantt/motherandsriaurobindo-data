class BooksController < ApplicationController
  def index
  end

  def new
    @book = Book.new
    gon.neue = true
  end

  def create
    @book = Book.new(book_params)
    gon.create = true
    if @book.save
      redirect_to books_path
    else
      render 'new'
    end
  end

  def show
    @book = Book.find_by(compilation_code: params[:compilation], volume: params[:volume])
    gon.description = @book.description
  end

  def edit
    @book = Book.find(params[:id])
    # debug
    gon.book = { author_code: @book.author_code, compilation_code: @book.compilation_code, volume: @book.volume }
    gon.edit = true
  end

  def update
    @book = Book.find(params[:id])
    if @book.update(book_params)
      redirect_to volume_path(@book.compilation_code, @book.volume)
    else
      render 'edit'
    end
  end

  private

  def book_params
    params.require(:book).permit(:title, :subtitle, :author, :author_code, :compilation, :compilation_code, :volume, :description)
  end
end
