module EntriesHelper
  def get_entries
    entries_dom = ''
    @entries.each do |alphabet|
      entries_dom += "<li class='alphabet'>" + alphabet[0] + '</li>'
      alphabet[1].each do |e|
        entries_dom += "<li><a href='" + (e[1].blank? ? e[0] : e[1]) + "'>" + e[0] + '</a></li>'
      end
    end
    entries_dom
  end
end
