<?php
/**
 * Egypt Fashion Child Theme Functions
 *
 * @package EgyptFashionChild
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Enqueue parent and child stylesheets.
 */
function ef_enqueue_theme_styles() {
    $parent_handle = 'twentytwentyfive-style';
    
    // Parent theme style
    wp_enqueue_style(
        $parent_handle,
        get_template_directory_uri() . '/style.css',
        [],
        wp_get_theme()->parent() ? wp_get_theme()->parent()->get('Version') : '1.0.0'
    );

    // Child theme style
    wp_enqueue_style(
        'egypt-fashion-child-style',
        get_stylesheet_uri(),
        [$parent_handle],
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'ef_enqueue_theme_styles');

/**
 * Declare WooCommerce theme support features.
 */
function ef_add_woocommerce_support() {
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
}
add_action('after_setup_theme', 'ef_add_woocommerce_support');

require_once __DIR__ . '/storefront.php';

function madar_enqueue_storefront_styles() {
    wp_enqueue_style('madar-storefront', get_stylesheet_directory_uri() . '/assets/storefront.css', ['egypt-fashion-child-style'], '1.1.0');
}
add_action('wp_enqueue_scripts', 'madar_enqueue_storefront_styles', 20);
