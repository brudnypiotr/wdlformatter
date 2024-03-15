#!/usr/bin/env ruby

# Add a definition of a non-optional "ghost variable"
def ghost_var(declaration)
  ws = declaration[1]
  opt_type = declaration[2]
  opt_name = declaration[3]
  
  lhs = "#{opt_type} #{opt_name}__ = "
  if opt_type =~ /^Array/ then
    rhs = "if defined(#{opt_name}) then select_all(#{opt_name}) else []"
  elsif opt_type == "String" || opt_type == "File" then
    rhs = "select_first([#{opt_name}, \"\"])"
  elsif opt_type == "Int" then
    rhs = "select_first([#{opt_name}, 0])"
  end
  ws + lhs + rhs + "\n"
end

# Substitute optional variables with their ghosts
def subst_variable(line, var)
  line.gsub!(
    /([$~]\{.*?)\b#{Regexp.quote(var)}(?!\w)/,
    '\1' + "#{var}__")
  line.gsub!(
    /(\+\s*)#{Regexp.quote(var)}(?!\w)/,
    '\1' + "#{var}__")
  line.gsub!(
    /(-\s+)#{Regexp.quote(var)}(?!\w)/,
    '\1' + "#{var}__")
  line.gsub!(
    /(?<=\*)(\s*)#{Regexp.quote(var)}(?!\w)/,
    '\1' + "#{var}__")
  line.gsub!(
    /(?<=\=\=)(\s*)#{Regexp.quote(var)}(?!\w)/,
    '\1' + "#{var}__")
  line.gsub!(
    /\b#{Regexp.quote(var)}(\s*)(?=\+)/,
    "#{var}__" + '\1')
  line.gsub!(
    /\b#{Regexp.quote(var)}(\s*)(?=-)/,
    "#{var}__" + '\1')
  line.gsub!(
    /\b#{Regexp.quote(var)}(\s*)(?=\*)/,
    "#{var}__" + '\1')
  line.gsub!(
    /\b#{Regexp.quote(var)}(\s*)(?=\=\=)/,
    "#{var}__" + '\1')
end

# Fix issues with optional variables in a WDL file
def fix_file(filename)
  output = ""
  scope = ""
  new_scope = false
  opt_vars = {}
  var_names = []

  File.open(filename).each_with_index do |line, i|
    if line =~ /^\s*(workflow|task)/ then
      scope = "*****" + line.gsub(/[^a-zA-Z0-9]/, "_") + "*****"
      opt_vars[scope] = []
      new_scope = true
    end

    new_opt_var = /^(\s*)(Int|String|File|Array\[.*?\])\?\s+(\w+)/.match(line)
    new_undef_var = /^\s*(Int|String|File|Array\[.*?\])\s+\w+\s*$/.match(line)
    if new_opt_var then
      if new_opt_var[2] != "File" then
        var_names.append(new_opt_var[3])
        output += ghost_var(new_opt_var)
      end
      opt_vars[scope].append(line)
    elsif new_undef_var then
      opt_vars[scope].append(line)
    else
      var = var_names.select { |v| line[v] }
      var.each { |v| subst_variable(line, v) }
      output += line
    end

    if new_scope && line =~ /{/ then
      output += scope
      new_scope = false
    end
  end

  opt_vars.each do |mark, declarations|
    output.sub!(mark, declarations.join(""))
  end

  output
end

print fix_file(ARGV[0])

