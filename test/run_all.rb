Dir[File.expand_path('*_test.rb', __dir__)].sort.each do |path|
  require path
end
