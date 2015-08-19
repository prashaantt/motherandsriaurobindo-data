namespace :import do
  desc 'Import an author'
  task :author, [:auth] => :environment do |task, args|
    if args.auth
      if args.auth == 'm'
        import_author(args.auth, %w(cwm cwmfr agenda agendafr))
      elsif args.auth == 'sa'
        import_author(args.auth, %w(arya sabcl cwsa))
      else
        puts "Author data not available for #{args.auth}"
      end
    else
      puts "Usage: `rake import:author[author_name]`"
    end
  end

  desc 'Import a compilation'
  task :compilation, [:comp] => :environment do |task, args|
    base_dir = File.join(Rails.root, 'data', 'compilations')
    Dir.chdir(base_dir)
    if args.comp
      filename = args.comp + '.rb'
      if !File.file?(filename)
        puts "File not found at the specified location #{Dir.pwd}/#{filename}"
      else
        Rake::Task['import:volumes'].invoke(args.comp)
        Rake::Task['import:volumes'].reenable
        puts "\nCompiling #{args.comp}"
        path = File.join(base_dir, filename)
        f = File.open(path)
        file_contents = eval(f.read)
        old_comp = Compilation.find_by({comp: args.comp})
        unless old_comp.nil?
          old_comp.delete
        end
        Compilation.create!(file_contents)
      end
    else
      puts "Usage: `rake import:compilation[compilation_name]`"
    end
  end

  desc 'Import one or more volumes'
  task :volumes, [:comp, :vol] => :environment do |task, args|
    base_dir = File.join(Rails.root, 'data', 'volumes')
    if args.comp && args.vol
      path = File.join(base_dir, args.comp)
      Dir.chdir(path)
      if !File.file?(args.vol)
        puts "File not found at the specified location #{Dir.pwd}/#{args.vol}"
      elsif File.extname(args.vol) != '.rb'
        puts 'File should have .rb extension'
      else
        puts "\nImporting"
        create_volume(File.join(path, args.vol))
      end
    elsif args.comp
      comp_path = File.join(base_dir, args.comp)
      if !File.directory?(comp_path)
        puts "#{args.comp} is not a valid compilation name"
      elsif
        iterate(comp_path)
      end
    else
      Dir.chdir(base_dir)
      Dir['*'].each do |d|
        iterate(base_dir, d)
      end
    end
  end
end

def iterate(path)
  Dir.chdir(path)
  puts "\nImporting all files at #{Dir.pwd}:"
  vols = Dir['*']
  vols.each do |v|
    path = File.join(Dir.pwd, v)
    if File.extname(path) === '.rb'
      create_volume(path)
    end
  end
end

def create_volume(path)
  puts path
  f = File.open(path)
  file_contents = eval(f.read)
  vol = Volume.new(file_contents)
  old_vol = Volume.find_by({comp: vol.comp, vol: vol.vol})
  unless old_vol.nil?
    old_vol.delete
  end
  Volume.create!(file_contents)
end

def import_author(auth, compilations)
  compilation_dir = File.join(Rails.root, 'data', 'compilations')
  compilations.each do |comp|
    filename = File.join(compilation_dir, comp) + '.rb'
    if File.file?(filename)
      Rake::Task['import:compilation'].invoke(comp)
      Rake::Task['import:compilation'].reenable
    end
  end
  puts "\nCompiling author #{auth}"
  base_dir = File.join(Rails.root, 'data', 'authors')
  filename = auth + '.rb'
  path = File.join(base_dir, filename)
  f = File.open(path)
  file_contents = eval(f.read)
  old_auth = Author.find_by({auth: auth})
  unless old_auth.nil?
    old_auth.delete
  end
  Author.create!(file_contents)
end
