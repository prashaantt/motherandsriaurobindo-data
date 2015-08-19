# Minimal sample configuration file for Unicorn (not Rack) when used
# with daemonization (unicorn -D) started in your working directory.
#
# See http://unicorn.bogomips.org/Unicorn/Configurator.html for complete
# documentation.
# See also http://unicorn.bogomips.org/examples/unicorn.conf.rb for
# a more verbose configuration using more features.

listen 3000 # by default Unicorn listens on port 8080
worker_processes 3 # this should be >= nr_cpus

APP_PATH = Rails.root.to_s
working_directory APP_PATH

# write to log files only in production
if Rails.env.production?
  stderr_path APP_PATH + '/log/unicorn.stderr.log'
  stdout_path APP_PATH + '/log/unicorn.stdout.log'
end

preload_app false
