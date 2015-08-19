require 'redcarpet/render_strip'

class HTMLWithPants < Redcarpet::Render::HTML
  include Redcarpet::Render::SmartyPants
end

# html_renderer = Redcarpet::Render::HTML.new(hard_wrap: true)

Rails.application.config.markdown = Redcarpet::Markdown.new(
  HTMLWithPants, lax_spacing: true, footnotes: true,
                 render_options: { hard_wrap: true })

Rails.application.config.md_to_text = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
