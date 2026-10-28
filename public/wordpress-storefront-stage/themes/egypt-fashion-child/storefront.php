<?php

if (!defined('ABSPATH')) {
    exit;
}

function madar_storefront_image($filename) {
    return get_stylesheet_directory_uri() . '/assets/images/' . $filename;
}

function madar_storefront_shop_url() {
    return function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');
}

function madar_storefront_header() {
    ob_start();
    ?>
    <div class="madar:bg-[#f6f3ed] madar:text-[#292923] madar:[font-family:Alexandria,sans-serif]">
        <div class="madar:border-b madar:border-[#dcd8cf] madar:px-[5%] madar:py-3 madar:text-center madar:text-[10px]">تفاصيل صغيرة. حضور مختلف. — عالم الرجال والأطفال</div>
        <div class="madar:mx-auto madar:flex madar:max-w-[1500px] madar:flex-wrap madar:items-center madar:justify-between madar:gap-5 madar:px-[5%] madar:py-7">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="madar:text-[48px] madar:leading-none madar:no-underline madar:[font-family:'Noto_Naskh_Arabic',serif]" aria-label="مدار — الرئيسية">مدار</a>
            <nav aria-label="التنقل الرئيسي" class="madar:flex madar:gap-6 madar:text-[11px]">
                <a href="<?php echo esc_url(home_url('/')); ?>">الرئيسية</a>
                <a href="<?php echo esc_url(madar_storefront_shop_url()); ?>">التشكيلة</a>
                <a href="<?php echo esc_url(home_url('/#madar-worlds')); ?>">رجال وأطفال</a>
            </nav>
            <div class="madar:flex madar:items-center madar:gap-5 madar:text-[11px]">
                <?php echo do_shortcode('[madar_account_link]'); ?>
                <?php if (function_exists('WC')) { echo do_blocks('<!-- wp:woocommerce/mini-cart /-->'); } ?>
            </div>
            <details class="madar:w-full madar:border-t madar:border-[#dcd8cf] madar:pt-3 madar:text-[11px]">
                <summary class="madar:cursor-pointer">ابحث عن قطعتك</summary>
                <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>" class="madar:mt-4 madar:flex madar:gap-3">
                    <label for="madar-product-search" class="madar:sr-only">البحث في المنتجات</label>
                    <input id="madar-product-search" type="search" name="s" value="<?php echo esc_attr(get_search_query()); ?>" placeholder="اكتب اسم المنتج…" class="madar:min-w-0 madar:flex-1 madar:border madar:border-[#dcd8cf] madar:bg-transparent madar:p-3" />
                    <input type="hidden" name="post_type" value="product" />
                    <button type="submit" class="madar:cursor-pointer madar:border-0 madar:bg-[#292923] madar:px-6 madar:text-white">بحث</button>
                </form>
            </details>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_header', 'madar_storefront_header');

function madar_storefront_home() {
    $shop_url = madar_storefront_shop_url();
    ob_start();
    ?>
    <main dir="rtl" class="madar:bg-[#f6f3ed] madar:text-[#292923] madar:[font-family:Alexandria,sans-serif]">
        <section class="madar:mx-auto madar:grid madar:max-w-[1500px] madar:gap-10 madar:px-[5%] madar:pb-12 madar:md:grid-cols-2 madar:md:items-center">
            <div class="madar:py-10">
                <p class="madar:text-[10px] madar:text-[#69675f]">مدار / عالم الرجال والأطفال</p>
                <h1 class="madar:my-8 madar:text-[58px] madar:leading-[1.35] madar:font-normal madar:lg:text-[88px] madar:[font-family:'Noto_Naskh_Arabic',serif]">حضور هادئ.<br /><span class="madar:text-[#817866]">على مدار يومك.</span></h1>
                <p class="madar:max-w-md madar:text-[13px] madar:leading-8 madar:text-[#69675f]">اختيارات تشبهك، ومساحة لكل تفاصيل يومك. اكتشف عالمًا من الملابس للرجال والأطفال.</p>
                <a href="<?php echo esc_url($shop_url); ?>" class="madar:mt-8 madar:inline-flex madar:items-center madar:gap-12 madar:bg-[#292923] madar:px-7 madar:py-5 madar:text-[12px] madar:text-[#f6f3ed] madar:no-underline madar:transition-colors madar:hover:bg-[#635c4d]">اكتشف التشكيلة <span aria-hidden="true">←</span></a>
                <p dir="ltr" class="madar:mt-12 madar:text-right madar:text-[9px] madar:tracking-[.16em]">LESS, BUT BETTER. / MADAR</p>
            </div>
            <div class="madar:group madar:relative madar:overflow-hidden">
                <img src="<?php echo esc_url(madar_storefront_image('campaign.jpg')); ?>" alt="إطلالة رجالية بألوان هادئة" width="900" height="1100" fetchpriority="high" class="madar:block madar:h-[520px] madar:w-full madar:object-cover madar:object-[center_35%] madar:transition-transform madar:duration-1000 madar:group-hover:scale-105 madar:md:h-[650px] madar:motion-reduce:transform-none" />
                <span class="madar:absolute madar:right-5 madar:bottom-5 madar:left-5 madar:bg-[#f6f3ed]/90 madar:p-4 madar:text-[10px]">من النظرة الأولى، إلى كل يوم.</span>
            </div>
        </section>
        <div class="madar:overflow-hidden madar:border-y madar:border-[#dcd8cf] madar:py-6" aria-label="رجال وأطفال — اختيارات على ذوقك — أقل، ولكن أجمل">
            <div dir="ltr" class="madar:madar-line-track madar:flex madar:w-max madar:text-[12px]">
                <?php for ($copy = 0; $copy < 2; $copy++) { ?>
                <div aria-hidden="true" class="madar:flex madar:min-w-[100vw] madar:shrink-0 madar:items-center madar:justify-around madar:gap-12 madar:px-6 madar:whitespace-nowrap">
                    <span>رجال وأطفال</span><span>✳</span><span>اختيارات على ذوقك</span><span>✳</span><span>أقل، ولكن أجمل</span><span>✳</span><span>THOUGHTFULLY CHOSEN.</span><span>✳</span>
                </div>
                <?php } ?>
            </div>
        </div>
        <section id="madar-worlds" class="madar:mx-auto madar:max-w-[1500px] madar:px-[5%] madar:py-20">
            <p class="madar:text-[10px] madar:text-[#817866]">عالم مدار / TWO WORLDS, ONE SPIRIT</p>
            <h2 class="madar:mb-10 madar:text-[42px] madar:font-normal madar:[font-family:'Noto_Naskh_Arabic',serif]">مساحة لك. ومساحة لهم.</h2>
            <div class="madar:grid madar:gap-8 madar:md:grid-cols-2">
                <?php foreach ([['coat.jpg', 'للرجال', 'تفاصيل تصنع حضورك.'], ['kids.jpg', 'للأطفال', 'مساحة لكل يوم جديد.']] as $world) { ?>
                <a href="<?php echo esc_url($shop_url); ?>" class="madar:group madar:block madar:no-underline">
                    <div class="madar:overflow-hidden"><img loading="lazy" src="<?php echo esc_url(madar_storefront_image($world[0])); ?>" alt="<?php echo esc_attr($world[1]); ?>" width="700" height="850" class="madar:block madar:aspect-[4/5] madar:w-full madar:object-cover madar:transition-transform madar:duration-700 madar:group-hover:scale-105 madar:motion-reduce:transform-none" /></div>
                    <div class="madar:mt-5 madar:flex madar:justify-between madar:gap-4"><h3 class="madar:m-0 madar:text-[30px] madar:font-normal madar:[font-family:'Noto_Naskh_Arabic',serif]"><?php echo esc_html($world[1]); ?></h3><span aria-hidden="true">↗</span></div>
                    <p class="madar:text-[11px] madar:text-[#69675f]"><?php echo esc_html($world[2]); ?></p>
                </a>
                <?php } ?>
            </div>
            <p class="madar:mt-6 madar:text-[10px] madar:text-[#69675f]">الصور للإلهام؛ استعرض المنتجات الفعلية من التشكيلة. تقسيم الرجال والأطفال يحتاج تصنيفات معتمدة للمتجر.</p>
        </section>
        <section class="madar:px-[5%] madar:pb-20">
            <div class="madar:mb-10 madar:flex madar:flex-wrap madar:items-center madar:justify-between madar:gap-5"><div><p class="madar:text-[10px] madar:text-[#817866]">من التشكيلة</p><h2 class="madar:text-[42px] madar:font-normal madar:[font-family:'Noto_Naskh_Arabic',serif]">اختيارات على مدار يومك.</h2></div><a href="<?php echo esc_url($shop_url); ?>" class="madar:text-[12px]">شوف التشكيلة كاملة ←</a></div>
            <div class="madar:madar-product-grid"><?php if (shortcode_exists('products')) { echo do_shortcode('[products limit="4" columns="4" orderby="date" order="DESC"]'); } ?></div>
        </section>
        <section class="madar:bg-[#e8e3d8] madar:px-[8%] madar:py-24 madar:text-center"><p class="madar:text-[10px] madar:tracking-widest">THE MADAR WAY</p><h2 class="madar:my-8 madar:text-[48px] madar:leading-[1.4] madar:font-normal madar:md:text-[70px] madar:[font-family:'Noto_Naskh_Arabic',serif]">مش محتاج كتير.<br />محتاج اللي يشبهك.</h2><p class="madar:mx-auto madar:max-w-lg madar:text-[12px] madar:leading-8 madar:text-[#69675f]">حضور مش محتاج صوت عالي. اختار على ذوقك، والبس بطريقتك.</p></section>
        <section class="madar:grid madar:md:grid-cols-2"><img loading="lazy" src="<?php echo esc_url(madar_storefront_image('city-edit.jpg')); ?>" alt="إطلالة رجالية في المدينة" width="900" height="1000" class="madar:block madar:h-[540px] madar:w-full madar:object-cover madar:object-[center_70%]" /><div class="madar:flex madar:flex-col madar:items-start madar:justify-center madar:p-[12%]"><p class="madar:text-[10px] madar:tracking-widest">OFF DUTY / ON YOUR TERMS</p><h2 class="madar:my-7 madar:text-[48px] madar:font-normal madar:[font-family:'Noto_Naskh_Arabic',serif]">إيقاع المدينة.<br />على مزاجك.</h2><p class="madar:text-[12px] madar:leading-8 madar:text-[#69675f]">من أول خطوة، لآخر مشوار. اكتشف اختياراتك الجديدة.</p><a href="<?php echo esc_url($shop_url); ?>" class="madar:mt-5 madar:border-b madar:border-[#292923] madar:pb-3 madar:text-[12px]">اكتشف المزيد ←</a></div></section>
    </main>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_home', 'madar_storefront_home');

function madar_storefront_footer() {
    ob_start();
    ?>
    <div class="madar:bg-[#f6f3ed] madar:px-[5%] madar:py-14 madar:text-[#292923] madar:[font-family:Alexandria,sans-serif] madar:border-t madar:border-[#dcd8cf]">
        <div class="madar:flex madar:flex-wrap madar:justify-between madar:gap-10">
            <div><a href="<?php echo esc_url(home_url('/')); ?>" class="madar:text-[52px] madar:no-underline madar:[font-family:'Noto_Naskh_Arabic',serif]">مدار</a><p class="madar:text-[11px] madar:text-[#69675f]">حضور هادئ، على مدار يومك.</p></div>
            <nav aria-label="روابط التذييل" class="madar:flex madar:flex-wrap madar:items-start madar:gap-7 madar:text-[12px]">
                <a href="<?php echo esc_url(madar_storefront_shop_url()); ?>">التشكيلة</a>
                <?php echo do_shortcode('[madar_account_link]'); ?>
                <?php if (function_exists('wc_get_cart_url')) { ?><a href="<?php echo esc_url(wc_get_cart_url()); ?>">سلة المشتريات</a><?php } ?>
                <?php if (get_privacy_policy_url()) { ?><a href="<?php echo esc_url(get_privacy_policy_url()); ?>">سياسة الخصوصية</a><?php } ?>
            </nav>
        </div>
        <p class="madar:mt-12 madar:border-t madar:border-[#dcd8cf] madar:pt-5 madar:text-[9px] madar:text-[#69675f]">مدار — نسخة تجريبية. الصور والمحتوى للإلهام؛ بيانات المنتجات الفعلية موضحة في المتجر.</p>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_footer', 'madar_storefront_footer');
