class CompilationsController < ApplicationController
  def show
    respond_to do |format|
      format.html {
        unless params['_escaped_fragment_'].nil?
          @data = get_compilation(params[:compilation])
        end
      }
      format.json {
        compilation = get_compilation(params[:compilation])
        render json: compilation 
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
      format.html {
      }
      format.json {
        comp = get_compilation(params[:compilation])
        top = []
        comp.conc.each do |alpha|
          top.push({a: alpha[:a], w: alpha[:w].reject{|w| stopwords.include? w[:w]}.sort_by{|w| w[:n]}.reverse.first(51)})
        end
        render json: {
          conc: {
            list: top,
            cmpn: comp.cmpn,
            auth: comp.auth
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
        comp = get_compilation(params[:compilation])
        alpha_words = {}
        alpha_count = 0
        comp.conc.each do |alpha|
          if alpha[:a] === params[:a]
            alpha_words = alpha[:w]
            alpha_count = alpha[:w].count
            break
          end
        end
        render json: {
          conc: {
            auth: comp.auth,
            cmpn: comp.cmpn,
            comp: comp.comp,
            n: alpha_count,
            list: [{a: params[:a], w: alpha_words}]
          }
        }
      }
    end
  end

  private

  def get_compilation(compilation)
    Compilation.where(comp: compilation).without(:id).first
  end
end
