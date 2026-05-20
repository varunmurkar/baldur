module Baldur
  module UiHelperSidebar
    include Baldur::RenderHelper
    include Baldur::MarketingHelper

    class SidebarBuilder
      attr_reader :header_content, :footer_content, :mobile_header_content, :mobile_footer_content

      def initialize(view_context)
        @view_context = view_context
      end

      def with_header(&block)
        @header_content = capture_slot(&block)
        nil
      end

      def with_footer(&block)
        @footer_content = capture_slot(&block)
        nil
      end

      def with_mobile_header(&block)
        @mobile_header_content = capture_slot(&block)
        nil
      end

      def with_mobile_footer(&block)
        @mobile_footer_content = capture_slot(&block)
        nil
      end

      private

      def capture_slot(&block)
        return unless block_given?

        @view_context.capture(&block)
      end
    end

    def ui_sidebar(primary_links:, secondary_links: [], secondary_label: nil, brand_path: nil, brand_name: nil,
                   brand_wordmark: nil, brand_logo: nil, header_content: nil, footer_content: nil, mobile_header_content: nil, mobile_footer_content: nil, shell_class: nil, &block)
      builder = SidebarBuilder.new(self)
      body_content = capture(builder, &block) if block_given?

      baldur_render 'baldur/components/sidebar',
                    brand: ui_sidebar_resolve_brand(
                      brand_path: brand_path,
                      brand_name: brand_name,
                      brand_wordmark: brand_wordmark,
                      brand_logo: brand_logo
                    ),
                    primary_links: ui_sidebar_normalize_links(primary_links),
                    secondary_links: ui_sidebar_normalize_links(secondary_links),
                    secondary_label: secondary_label,
                    header_content: builder.header_content.presence || header_content,
                    footer_content: builder.footer_content.presence || footer_content,
                    mobile_header_content: builder.mobile_header_content.presence || mobile_header_content || builder.header_content.presence || header_content,
                    mobile_footer_content: builder.mobile_footer_content.presence || mobile_footer_content || builder.footer_content.presence || footer_content,
                    shell_class: shell_class,
                    collapsed: ui_sidebar_collapsed?,
                    body_content: body_content
    end

    private

    def ui_sidebar_resolve_brand(brand_path:, brand_name:, brand_wordmark:, brand_logo:)
      overrides = {
        name: brand_name,
        wordmark: brand_wordmark,
        logo_src: brand_logo,
        href: brand_path.presence || '#'
      }.compact

      ui_marketing_resolve_brand(overrides)
    end

    def ui_sidebar_normalize_links(links)
      Array(links).filter_map do |link|
        next if link.blank?

        normalized = link.to_h.symbolize_keys
        next if normalized[:name].blank? || normalized[:path].blank?

        {
          name: normalized[:name].to_s,
          path: normalized[:path],
          icon: normalized[:icon].presence || 'circle',
          active: !!normalized[:active],
          title: normalized[:title].presence || normalized[:name].to_s,
          method: normalized[:method],
          data: normalized[:data].respond_to?(:to_h) ? normalized[:data].to_h : nil,
          html_options: normalized[:html_options].respond_to?(:to_h) ? normalized[:html_options].to_h.symbolize_keys : {}
        }
      end
    end

    def ui_sidebar_collapsed?
      return false unless respond_to?(:cookies)

      cookies['baldur-sidebar-collapsed'] == 'true'
    end
  end
end
