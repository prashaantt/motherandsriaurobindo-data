class QuotesController < ApplicationController

  def index
    respond_to do |format|
      format.html {}
      format.json {
        render json: {quotes: order_quotes}
      }
    end
  end

  def create
    quote = Quote.new(quote_params)
    url = quote[:ref].split('/')
    quote[:comp] = url[3]
    quote[:vol] = url[4]
    quote[:auth] = %w(cwm cwmfr agenda agendafr).include?(url[3]) ? 'm' : 'sa'
    quote[:t] = Volume.where(comp: url[3], vol: url[4]).first.t rescue nil
    quote[:created_by] = current_user.uid
    quote.save
    render nothing: true
  end

  def update
    quote = Quote.find(params[:id])
    quote[:updated_by] = current_user.uid
    quote.update(quote_params)
    render nothing: true
  end

  def destroy
    quote = Quote.find(params[:id])
    quote.destroy
    render nothing: true
  end

  private

  def quote_params
    params.require(:quote).permit(:sel, :ref, :tags => [])
  end

  def order_quotes
    volume_quotes = []
    Quote.all.group_by {|q| [q.comp, q.vol]}.each do |vol_quotes|
      volume = {}
      volume[:t] = vol_quotes[1][0].t
      # volume[:auth] = vol_quotes[1][0].auth
      volume[:comp] = vol_quotes[1][0].comp
      volume[:vol] = vol_quotes[1][0].vol
      volume[:list] = []
      vol_quotes[1].each do |quote|
        q = {}
        q[:ref] = quote[:ref]
        q[:sel] = quote[:sel]
        q[:auth] = quote[:auth]
        q[:id] = quote[:id].to_s if current_user
        if !quote[:tags].nil? && quote[:tags].length != 0
          q[:tags] = quote[:tags]
        end
        volume[:list].push(q)
      end
      volume_quotes.push(volume)
    end
    volume_quotes
  end
end
