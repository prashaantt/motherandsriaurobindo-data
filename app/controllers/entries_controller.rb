class EntriesController < ApplicationController
  def index
    respond_to do |format|
      format.html do
        if params['_escaped_fragment_'].nil?
          gon.dataEndpoint = 'entries'
        else
          @data = get_entries
          @data[:t] = 'Dictionary'
        end
      end
      format.json do
        render json: get_entries.to_json
      end
    end
  end

  def new
    if current_user
      @entry = Entry.new
      gon.entries = 'new'
    else
      redirect_to root_url
    end
  end

  def create
    @entry = Entry.new(entry_params)
    gon.create = 'true'
    @entry.created_by = current_user.id
    if @entry.save
      redirect_to dictionary_entry_path(@entry)
    else
      render 'new'
    end
  end

  def edit
    # temporary auth hack
    if current_user
      @entry = Entry.find_by(url: params[:id])
      gon.entries = 'edit'
    else
      redirect_to root_url
    end
  end

  def update
    @entry = Entry.find_by(url: params[:id])
    gon.update = 'true'
    @entry.updated_by = current_user.id
    @entry.updated_at = Time.now
    if @entry.update(entry_params)
      redirect_to dictionary_entry_path(@entry)
    else
      render 'edit'
    end
  end

  def show
    respond_to do |format|
      format.html do
        unless params['_escaped_fragment_'].nil?
          @data = get_entry(params[:id])
        end
      end
      format.json do
        entry = get_entry(params[:id])
        render json: entry
      end
    end
  end

  def destroy
    @entry = Entry.find_by(url: params[:id])
    @entry.destroy

    redirect_to dictionary_path
  end

  private

  def entry_params
    params.require(:entry).permit(:word, :definition, :related_words)
  end

  def get_entries
    entries_list = []
    Entry.asc(:url).pluck(:word, :url, :related_words).each do |e|
      entry = {}
      entry[:w] = e[0]
      if !e[1].blank? && e[0] != e[1]
        entry[:u] = e[1]
      end
      entry[:r] = e[2] unless e[2].blank?
      alpha = entry[:w][0].downcase
      alpha = /^[a-z]/.match(alpha) ? alpha : '&'
      if !entries_list.empty? && entries_list.last[:a] == alpha
        entries_list.last[:w].push(entry)
      else
        group = {}
        group[:a] = alpha
        group[:w] = []
        group[:w].push(entry)
        entries_list.push(group)
      end
    end
    entries = {}
    entries[:t] = 'Dictionary'
    entries[:list] = entries_list
    { "entries" => entries }
  end

  def get_entry(url)
    result = Entry.where(url: url.to_url).without(:created_by, :updated_by, :updated_at, :id).first
  end
end
