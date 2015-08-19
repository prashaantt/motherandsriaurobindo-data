namespace :export do
  task :entries => :environment do
    count = Entry.count
    puts "Entry.create!(["
    Entry.all.each_with_index do |e, index|
      # TODO: add string escaping
      puts "  {word: \"#{e.word}\", definition: \"#{e.definition}\"" + (e.related_words.nil? || e.related_words.blank? ? '' : ", related_words: \"#{e.related_words}\"") + '}' + (index < count - 1 ? ',' : '')
    end
    puts "])"
  end
end
