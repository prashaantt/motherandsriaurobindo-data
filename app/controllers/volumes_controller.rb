class VolumesController < ApplicationController
  def show
    respond_to do |format|
      format.html {
        unless params['_escaped_fragment_'].nil?
          @data = get_volume(params[:compilation], params[:volume])
        end
      }
      format.json {
        volume = get_volume(params[:compilation], params[:volume])
        render json: volume 
      }
    end
  end

  def concordance
    gon.concordance = true
    stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an",
      "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
      "below", "between", "both", "but", "by", "can", "can't", "cannot", "could", "couldn't",
      "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each",
      "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't",
      "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
      "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if",
      "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more",
      "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
      "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
      "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
      "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
      "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
      "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
      "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
      "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while",
      "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you",
      "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"]
    respond_to do |format|
      format.html {}
      format.json {
        vol = get_volume(params[:compilation], params[:volume])
        top = []
        vol.conc.each do |alpha|
          top.push({a: alpha[:a], w: alpha[:w].reject{|w| stopwords.include? w[:w]}.sort_by{|w| w[:n]}.reverse.first(51)})
        end
        render json: {
          conc: {
            list: top,
            t: vol.t,
            auth: vol.auth,
            curl: vol.curl,
            cmpn: vol.cmpn,
            vol: vol.vol
          }
        }
      }
    end
  end

  def concordance_alpha
    gon.concordance = true
    respond_to do |format|
      format.html {}
      format.json {
        vol = get_volume(params[:compilation], params[:volume])
        alpha_words = {}
        alpha_count = 0
        vol.conc.each do |alpha|
          if alpha[:a] === params[:a]
            alpha_words = alpha[:w]
            alpha_count = alpha[:w].count
            break
          end
        end
        render json: {
          conc: {
            t: vol.t,
            auth: vol.auth,
            curl: vol.curl,
            cmpn: vol.cmpn,
            vol: vol.vol,
            n: alpha_count,
            list: [{a: params[:a], w: alpha_words}]
          }
        }
      }
    end
  end

  private

  def get_volume(compilation, volume)
    Volume.where(comp: compilation, vol: volume).without(:parts, :books, :chapters, :desc).first
  end
end
