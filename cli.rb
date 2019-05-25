#!/usr/bin/env ruby

require 'thor'
require 'fileutils'

class CLI < Thor
  include Thor::Actions

  def initialize(*args)
    super(*args)
    @curr_dir = File.expand_path('.', __dir__)
  end

  desc 'launch [ARGS]', 'launch program in docker image'
  def launch(*args)
    uid = `id -u`.strip
    gid = `id -g`.strip
    args_line = args.collect(&:inspect).join(' ')

    # linux cargo home
    cargo_home = File.join(Dir.home, '.cargo-linux')
    FileUtils.mkdir_p(cargo_home)
    # puts "cargo_home = #{cargo_home}"
    cmdline = [
      %(docker run),
      %(--rm),
      %(--userns host),
      %(--user "#{uid}:#{gid}"),
      %(-e "CARGO_HOME=/cargo"),
      %(-v "#{cargo_home}:/cargo:rw"),
      %(-v "#{@curr_dir}:/project:ro"),
      %(-v "#{@curr_dir}/target:/project/target:rw"),
      %(-w /project),
      %(-it rust),
      args_line
    ].join(' ')
    if ENV['DRY_RUN'] == '1'
      puts cmdline
    else
      run cmdline
    end
  end

  desc 'build_linux', 'run cargo build --release --target x86_64-unknown-linux-gnu'
  def build_linux(*args)
    launch('cargo', 'build', '--release', '--target', 'x86_64-unknown-linux-gnu', *args)
  end

  desc 'build_yscript', 'build yscript for linux'
  def build_yscript(*args)
    build_linux('-p', 'yscript')
    inside(@curr_dir) do
      run %(cp ./target/x86_64-unknown-linux-gnu/release/yscript ./containers/bin/yscript)
    end
  end

  desc 'build_yeditor', 'build yeditor for linux'
  def build_yeditor(*args)
    build_linux('-p', 'yeditor')
  end

  desc 'watch [PROJECT]', 'watch project changes and run'
  def watch(project = 'yeditor')
    project_dir = File.join(@curr_dir, project)
    inside(project_dir) do
      # run %(systemfd --no-pid -s tcp::127.0.0.1:4000 -- cargo watch -x run)
      run %(cargo watch -x run)
    end
  end
end

CLI.start if caller.empty?

##
## Usage:
## Drop this cli.rb file beside Cargo.toml and run
##    ./cli.rb build_linux
##
