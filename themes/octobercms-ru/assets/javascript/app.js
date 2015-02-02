/*
 * Application
 *
 */

(function($) {

    $(document).tooltip({
        selector: "[data-toggle=tooltip]"
    })

    // Focus state for append/prepend inputs
    $('.input-group').on('focus', '.form-control', function () {
        $(this).closest('.input-group, .form-group').addClass('focus');
    }).on('blur', '.form-control', function () {
        $(this).closest('.input-group, .form-group').removeClass('focus');
    });
    
    
    // Оформление внешних ссылок
    
    //$('a[href^=http]').attr({target:'_blank'});
    
    
    // Изменение минимальной высоты страницы
    
    function res(){
        
        h = 0;
        
        $('body').find('>*').each(function(){
            h = h + $(this).not('#layout-content').outerHeight();
        })
        
        $('#layout-content').css({ 
            minHeight: $(window).height() - h - 1
        })

    }
    
    $(window).each( res ).resize( res );
    
    
    // Убрать отступы у заголовков вначале статей
    
    $('#layout-content').find(':header').filter(function(index) {
        return $(this).prev().length < 1;
    }).css({
        marginTop: 0,
        paddingTop: 0
    })
    
    
    $('.tweet .info,.blog .text-muted, .date, .date a, .forum-post .text-muted, .small, small').each(function(){
    	var t = $(this);
    	var text = t.html().
    		// seconds
    		replace(/(.*)(1)\ (second|seconds)\ ago(.*)/, '$1$2 секунду назад$4').
    		replace(/(.*)([2-4])\ seconds\ ago(.*)/, '$1$2 секунды назад$3').
    		replace(/(.*)([5-9])\ seconds\ ago(.*)/, '$1$2 секунд назад$3').
    		// minuts
    		replace(/(.*)(1)\ (minute|minutes)\ ago(.*)/, '$1$2 минуту назад$4').
    		replace(/(.*)([2-4])\ minutes\ ago(.*)/, '$1$2 минуты назад$3').
    		replace(/(.*)([5-9])\ minutes\ ago(.*)/, '$1$2 минут назад$3').
    		// hours
    		replace(/(.*)(1)\ (hour|hours)\ ago(.*)/, '$1$2 час назад$4').
    		replace(/(.*)([2-4])\ hours\ ago(.*)/, '$1$2 часа назад$3').
    		replace(/(.*)([5-9])\ hours\ ago(.*)/, '$1$2 часов назад$3').
    		// days
    		replace(/(.*)(1)\ (day|days)\ ago(.*)/, '$1$2 день назад$4').
    		replace(/(.*)([2-4])\ days\ ago(.*)/, '$1$2 дня назад$3').
    		replace(/(.*)([5-9])\ days\ ago(.*)/, '$1$2 дней назад$3').
    		// weeks
    		replace(/(.*)(1)\ (week|weeks)\ ago(.*)/, '$1$2 неделю назад$4').
    		replace(/(.*)([2-4])\ weeks\ ago(.*)/, '$1$2 недели назад$3').
    		replace(/(.*)([5-9])\ weeks\ ago(.*)/, '$1$2 недель назад$3').
            // months
            replace(/(.*)(1)\ (month|months)\ ago(.*)/, '$1$2 месяц назад$4').
            replace(/(.*)([2-4])\ months\ ago(.*)/, '$1$2 месяца назад$3').
            replace(/(.*)([5-9])\ months\ ago(.*)/, '$1$2 месяцев назад$3').
    		// years
    		replace(/(.*)(1)\ (year|years)\ ago(.*)/, '$1$2 год назад$4').
    		replace(/(.*)([2-4])\ years\ ago(.*)/, '$1$2 года назад$3').
    		replace(/(.*)([5-9])\ years\ ago(.*)/, '$1$2 лет назад$3').
    		// Other
    		replace('Last updated', 'Отредактировано')
    	t.html(text)
    })
	
	
	$('pre code').each(function(){
        $(this).parent().addClass('prettyprint');
    });
    prettyPrint();

})(jQuery);