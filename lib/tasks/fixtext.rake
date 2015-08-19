namespace :fix do
  desc 'Fix txt to text'
  task :text, [:comp, :vol] => :environment do |task, args|
    base_dir = File.join(Rails.root, 'db', 'compilations')
    if args.comp && args.vol
      path = File.join(base_dir, args.comp)
      Dir.chdir(path)
      if !File.file?(args.vol)
        puts "File not found at the specified location #{Dir.pwd}/#{args.vol}"
      elsif File.extname(args.vol) != '.rb'
        puts 'File should have .rb extension'
      else
        puts "\nImporting"
        edit_volume(File.join(path, args.vol))
      end
    elsif args.comp
      iterate(base_dir, args.comp)
    else
      Dir.chdir(base_dir)
      Dir['*'].each do |d|
        iterate(base_dir, d)
      end
    end
  end
end

def iterate(base_dir, dir)
  Dir.chdir(File.join(base_dir, dir))
  puts "\nImporting all files at #{Dir.pwd}:"
  vols = Dir['*']
  vols.each do |v|
    path = File.join(Dir.pwd, v)
    if File.extname(path) === '.rb'
      create_volume(path)
    end
  end
end

def edit_volume (path)
  puts "#{path}"
  f = File.open(path)
  vol = eval(f.read)
  vol[:parts].each do |p|
    p[:chapters].each do |c|
      tx = ""
      unless c[:txt].nil? 
        c[:txt].each_with_index do |t, i|
          tx += "\n\n" if i > 0
          tx += t
        end
        c[:txt] = tx
      else
        c[:items].each do |i|
          tx = ""
          unless i[:txt].nil? 
            i[:txt].each_with_index do |t, i|
              tx += "\n\n" if i > 0
              tx += t
            end
            i[:txt] = tx
          end
        end
      end
    end
  end
  file_name = File.basename(path, '.rb')
  File.open("#{file_name}_fixed.rb", 'w') { |file| file.write(JSON.pretty_generate(vol)) }
end
