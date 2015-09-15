require 'erector'
require 'doc_page'
require 'step'
require 'big_checkbox'

class InstructorPage < Html5Page
  needs :site_name
  attr_reader :site_name

  def head_content
    title page_title
    script :src => firebase_javascript_url
    script :src => q_javascript_url
    script :src => "/assets/application.js"
    link   :href => "/assets/application.css", :rel => "stylesheet"
  end

  def site_title
    Titleizer.title_for_page(site_name)
  end

  def page_title
    "Instructor page for #{site_title}"
  end

  def firebase_javascript_url
    "https://cdn.firebase.com/js/client/2.2.9/firebase.js"
  end

  def q_javascript_url
    "https://cdnjs.cloudflare.com/ajax/libs/q.js/1.4.1/q.js"
  end

  def body_content
    nav(class: "top cf", role: "navigation") {

      div(class: "navbar-header cf title") {
        a(href: "/#{site_name}") {
          span("RailsBridge ", class: "brand")
          text site_title
        }
      }
    }

    main {
      h1 page_title, class: "doc_title"
      div(id: "instructor", class: :doc) {
        h2 class: "presence"
        div class: "topics"
      }

    }
  end

end
