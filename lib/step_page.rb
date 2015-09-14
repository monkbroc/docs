require 'erector'
require 'doc_page'
require 'step'
require 'big_checkbox'

class StepPage < DocPage
  def doc_content
    BigCheckbox.number = 0
    widget Step.new src: src, doc_path: @doc_path
  end
end
