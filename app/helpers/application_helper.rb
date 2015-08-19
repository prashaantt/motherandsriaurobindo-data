module ApplicationHelper
  def markdown(md_text)
    Rails.application.config.markdown.render(md_text)
  end

  def markdown_to_text(md_text)
    Rails.application.config.md_to_text.render(md_text)
  end

  def page_title
    compilation = ''
    heading = ''
    unless params[:controller] == 'volumes' && params[:action] == 'show'
      heading = @data[:t] || @data[:cmpn] || @data[:autn] || @data[:word] || ''
    end

    if params[:action] == 'show'
      if params[:controller] == 'chapters'
        compilation = ' · ' + @data.path[0][:t] + ' - ' + @data.path[1][:t]
      elsif params[:controller] == 'volumes'
        compilation = @data[:cmpa] + ' - ' + @data[:t]
      elsif params[:controller] == 'entries'
        compilation = ' · Dictionary'
      end
    end
    title = heading + compilation
    title.empty? ? '' : title + ' · '
  end

  def sri_aurobindo
    ['cwsa', 'sabcl', 'arya'].include?(params[:compilation]) || 'sa' == params[:author]
  end

  def mother
    ['cwm', 'agenda', 'cwmfr', 'agendafr'].include?(params[:compilation]) || 'm' == params[:author]
  end

  def process(obj)
    Mustache.template_path = File.join('app/views/templates/' + obj.class.to_s.downcase + 's')
    obj['text'] = obj.try(:text)
    obj['asset'] = ->(text) {
      asset = Mustache.render(text, obj)
      digest = Rails.application.assets.find_asset(asset).digest
      split_asset = asset.split('.')
      path = '/assets/' + split_asset[0] + (digest != '' ? '-' + digest : '') + '.' + split_asset[1];
      path
    }
    obj['marked'] = obj['markedBasic'] = ->(text) { markdown(Mustache.render(text, obj)) }
    obj['prv'] = ->(text) {
      prvt = Mustache.render(text, obj)
      prvt.length <= 40 ? '« ' + prvt : '« ' + prvt[0..40] + '...'
    }
    obj['nxt'] = ->(text) {
      nxtt = Mustache.render(text, obj)
      nxtt.length <= 40 ? nxtt + ' »' : nxtt[0..40] + '... »'
    }
    obj['padNum'] = ->(text) {
      val = Mustache.render(text, obj).to_i
      val <= 9 ? '0' + val.to_s : val
     }
    if obj.is_a?(Hash)
      obj
    else
      { obj.class.to_s.downcase.to_sym => obj.attributes }
    end
  end
end
