(function ($) {
    if ($(".commitmentSwiper").length) {
        var commitmentSwiper = new Swiper(".commitmentSwiper", {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 0,
            navigation: {
                nextEl: ".commitment-next",
                prevEl: ".commitment-prev"
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false
            }
        });
    }

    window.addEventListener('pagehide', function () {
        document.querySelectorAll('.swiper, .swiper-container').forEach(function (el) {
            if (el.swiper && el.swiper.autoplay && typeof el.swiper.autoplay.stop === 'function') {
                try {
                    el.swiper.autoplay.stop();
                } catch (e) {
                    console.warn('Swiper autoplay cleanup skipped', e);
                }
            }
        });
    });

    function installMetaLeadGuard() {
        if (typeof window.fbq !== "function" || window.fbq.__cookscapeLeadGuard) {
            return;
        }

        const originalFbq = window.fbq;
        const guardedFbq = function () {
            const args = Array.prototype.slice.call(arguments);

            if (args[0] === "track" && args[1] === "Lead" && !window.cookscapeAllowLeadPixel) {
                console.warn("Blocked Meta Lead event outside final estimate submit.");
                return;
            }

            return originalFbq.apply(this, args);
        };

        Object.keys(originalFbq).forEach(function (key) {
            guardedFbq[key] = originalFbq[key];
        });

        guardedFbq.__cookscapeLeadGuard = true;
        window.fbq = guardedFbq;
        window._fbq = guardedFbq;
    }

    installMetaLeadGuard();
    window.addEventListener("load", installMetaLeadGuard);

    $.get('ShortContact.html', function (data) {
        $('.page-wrapper').append(data);
    });

    function hasSubmittedToday() {
        let last = localStorage.getItem("cookscapePopupSubmitted");
        if (!last) return false;
        let lastDate = new Date(parseInt(last));
        let now = new Date();
        return lastDate.toDateString() === now.toDateString();
    }

    function trackCookscapeLead(source) {
        if (typeof window.fbq !== "function") {
            return;
        }

        window.cookscapeAllowLeadPixel = true;
        window.fbq("track", "Lead", {
            content_name: source,
            content_category: "Lead Generation"
        });
        window.cookscapeAllowLeadPixel = false;
    }

    function sendEmail(name, email, phone_number, msg_subject, message) {
        var settings = {
            "url": "https://api.juaninfotech.com/api/User/SendCookscapeEmail?Name=" + name +
                "&Email=" + email + "&Mobile=" + phone_number + "&Subject=" + msg_subject + "&Message=" + message,
            "method": "POST",
            "timeout": 0,
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    }

    $(document).on('click', '#btnSubmitConsoltation', function () {
        var overlay = document.getElementById("cookscapePopupOverlay");
        if (overlay) overlay.style.display = "block";
    });

    $(document).on('click', '#btnSubmitShortContact', function () {
        let name = $('#shortcontactName').val().trim();
        let mobile = $('#shortcontactMobile').val().trim();
        let email = $('#shortcontactEmail').val().trim();

        let valid = true;

        // Reset UI
        $('.error').text('');
        $('input').css('border', '1px solid #ddd');

        // Name validation
        if (!/^[A-Za-z ]{3,}$/.test(name)) {
            showErr('#shortcontactName', '#errName', 'Enter a valid name (min 3 letters)');
            valid = false;
        }

        // Mobile validation (India)
        if (!/^[6-9][0-9]{9}$/.test(mobile)) {
            showErr('#shortcontactMobile', '#errMobile', 'Enter valid 10 digit mobile number');
            valid = false;
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            showErr('#shortcontactEmail', '#errEmail', 'Enter a valid email address');
            valid = false;
        }

        if (!valid) return;

        var settings = {
            url: "https://api.juaninfotech.com/api/User/SendCookscapeEmail?Name=" +
                encodeURIComponent(name) +
                "&Email=" +
                encodeURIComponent(email) +
                "&Mobile=" +
                encodeURIComponent(mobile) +
                "&Subject=" +
                encodeURIComponent("Short Contact Popup") +
                "&Message=" +
                encodeURIComponent("Short contact form submission from the website."),
            method: "POST",
            timeout: 30000
        };

        $.ajax(settings)
            .done(function (response) {
                console.log("Short contact submitted successfully:", response);
                localStorage.setItem("cookscapePopupSubmitted", Date.now());
                trackCookscapeLead("Short Contact Popup");
                var overlay = document.getElementById("cookscapePopupOverlay");
                if (overlay) overlay.style.display = "none";
            })
            .fail(function (xhr, status, error) {
                console.warn("Short contact submission failed:", status, error);
                showErr('#shortcontactEmail', '#errEmail', 'Unable to submit right now. Please try again.');
            });
    });

    function showErr(input, err, msg) {
        $(input).css('border', '1px solid #e11d48').focus();
        $(err).text(msg);
    }

    function showCookscapePopup() {
        if (hasSubmittedToday()) return;
        var overlay = document.getElementById("cookscapePopupOverlay");
        if (overlay) {
            overlay.style.display = "block";
        }
    }
    function closeCookscapePopup() {
        var overlay = document.getElementById("cookscapePopupOverlay");
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    setInterval(showCookscapePopup, 300000);
    setTimeout(showCookscapePopup, 10000);




    (function ($) {
        "use strict";
        $("#contactForm").on("submit", function (event) {
            if (event.isDefaultPrevented()) {
                formError();
                submitMSG(false, "Did you fill up the form properly?");
            } else {
                event.preventDefault();
                submitForm();
            }
        });


        function submitForm() {
            var name = $("#name").val();
            var email = $("#email").val();
            var msg_subject = 'Website Enquiry';
            var phone_number = $("#phone_number").val();
            var message = $("#message").val();

            $("#contactForm")[0].reset();
            submitMSG(true, "Thanks for contacting us. We will get back to you shortly.");
            function submitMSG(valid, msg) {
                if (valid) {
                    var msgClasses = "h4 tada animated text-success";
                } else {
                    var msgClasses = "h4 text-danger";
                }
                $("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
            }

            var settings = {
                "url": "https://api.juaninfotech.com/api/User/SendCookscapeEmail?Name=" + name + "&Email=" + email + "&Mobile=" + phone_number + "&Subject=" + msg_subject + "&Message=" + message,
                "method": "POST",
                "timeout": 0,
            };

            $.ajax(settings)
                .done(function (response) {
                    console.log(response);
                    trackCookscapeLead("Contact Form");
                })
                .fail(function (xhr, status, error) {
                    console.warn("Contact form submission failed:", status, error);
                    $("#contactForm")[0].reset();
                    submitMSG(false, "Unable to submit right now. Please try again.");
                });
        }

        function sendEmail(name, email, phone_number, msg_subject, message) {
            var settings = {
                "url": "https://api.juaninfotech.com/api/User/SendCookscapeEmail?Name=" + name +
                    "&Email=" + email + "&Mobile=" + phone_number + "&Subject=" + msg_subject + "&Message=" + message,
                "method": "POST",
                "timeout": 0,
            };

            $.ajax(settings).done(function (response) {
                console.log(response);
            });
        }

        function formSuccess() {
            $("#contactForm")[0].reset();
            submitMSG(true, "Thanks for contacting us. We will get back to you shortly.");
        }

        function formError() {
            $("#contactForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass();
            });
        }

        function submitMSG(valid, msg) {
            if (valid) {
                var msgClasses = "h4 tada animated text-success";
            } else {
                var msgClasses = "h4 text-danger";
            }
            $("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
        }
    }(jQuery));

    $.get('quickestimate.html', function (data) {
        $('.page-wrapper').append(data);
        initQuickEstimateForm();
        initScripts();
        $('.spnYear').html(new Date().getFullYear());
    });

    $.get('journey.html', function (data) {
        $('.service-detail_inner').append(data);
    });

    "use strict";
    function initQuickEstimateForm() {
        let currentStep = 1;
        const totalSteps = 4;
        let hasSubmitted = false;
        const formSteps = document.querySelectorAll('.form-step');
        const progressSteps = document.querySelectorAll('.progress-step');
        const progressFill = document.getElementById('progressFill');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const errorMessage = document.getElementById('errorMessage');
        const form = document.getElementById('multiStepForm');
        const successMessage = document.getElementById('successMessage');
        function buildEstimateEmailBody() {
            let activeTab = $('.nav-tabs .nav-link.active').text().trim();

            let html = `<h2>🧾 New Quick Estimate Lead</h2><hr>`;
            html += `<b>Name:</b> ${$("#estimatefullName").val()}<br>`;
            html += `<b>Email:</b> ${$("#estimateemailid").val()}<br>`;
            html += `<b>Phone:</b> ${$("#estimatephonenumber").val()}<br><hr>`;

            /* HOME INTERIOR */
            if (activeTab === "Home Interior") {
                html += `<h3>🏠 Home Interior</h3>`;
                html += "<b>BHK:</b> " + $('input[name="rblHouseBHK"]:checked').parent().text().trim() + "<br>";

                let rooms = $('input[name="rblHouseRoomType"]');
                html += "<b>Living Room:</b> " + rooms.eq(0).val() + "<br>";
                html += "<b>Kitchen:</b> " + rooms.eq(1).val() + "<br>";
                html += "<b>Bedroom:</b> " + rooms.eq(2).val() + "<br>";
                html += "<b>Bathroom:</b> " + rooms.eq(3).val() + "<br>";
                html += "<b>Dining:</b> " + rooms.eq(4).val() + "<br>";
            }

            /* KITCHEN */
            if (activeTab === "Kitchen") {
                html += `<h3>🍳 Kitchen</h3>`;

                let layout = $('input[name="rblKitchenType"]:checked').parent().text().trim();
                html += "<b>Layout:</b> " + layout + "<br>";
                html += "<b>Dimensions:</b><br>";

                if (layout === "L-Shaped") {
                    html += "A : " + $('input[name="KitchenLshaped"]').eq(0).val() + " ft<br>";
                    html += "B : " + $('input[name="KitchenLshaped"]').eq(1).val() + " ft<br>";
                }

                if (layout === "Parallel") {
                    html += "A : " + $('input[name="KitchenParallel"]').eq(0).val() + " ft<br>";
                    html += "B : " + $('input[name="KitchenParallel"]').eq(1).val() + " ft<br>";
                }

                if (layout === "Straight") {
                    html += "A : " + $('input[name="KitchenStraight"]').eq(0).val() + " ft<br>";
                }

                if (layout === "U-Shaped") {
                    html += "A : " + $('input[name="KitchenUshaped"]').eq(0).val() + " ft<br>";
                    html += "B : " + $('input[name="KitchenUshaped"]').eq(1).val() + " ft<br>";
                    html += "C : " + $('input[name="KitchenUshaped"]').eq(2).val() + " ft<br>";
                }
            }

            /* WARDROBE */
            if (activeTab === "Wardrobe") {
                html += `<h3>👔 Wardrobe</h3>`;
                html += "<b>Height:</b> " + $('input[name="rblWardrobelength"]:checked').parent().text().trim() + "<br>";
                html += "<b>Type:</b> " + $('input[name="rblWardrobetype"]:checked').parent().text().trim() + "<br>";

                let accessories = [];
                $('input[name="rblWardrobefinish"]:checked').each(function () {
                    accessories.push($(this).parent().text().trim());
                });

                html += "<b>Accessories:</b> " + (accessories.length ? accessories.join(', ') : "None") + "<br>";
            }

            /* PACKAGE */
            html += `<hr><h3>💎 Package</h3>`;
            html += $("input[name=package]:checked").parent().text().trim();

            /* MESSAGE */
            html += `<hr><h3>📝 Message</h3>${$("#message").val() || "—"}`;

            return html;
        }
        function updateProgress() {
            const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
            progressFill.style.width = progress + '%';

            progressSteps.forEach((step, index) => {
                const stepNum = index + 1;
                step.classList.remove('active', 'completed');
                if (stepNum < currentStep) {
                    step.classList.add('completed');
                } else if (stepNum === currentStep) {
                    step.classList.add('active');
                }
            });

            formSteps.forEach(step => {
                step.classList.remove('active');
                if (parseInt(step.dataset.step) === currentStep) {
                    step.classList.add('active');
                }
            });

            prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
            nextBtn.textContent = currentStep === totalSteps ? 'Submit' : 'Continue';

            errorMessage.classList.remove('active');
        }

        function validateStep() {
            const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            const requiredInputs = currentStepElement.querySelectorAll('[required]');

            for (let input of requiredInputs) {
                if (!input.value.trim()) {
                    errorMessage.textContent = 'Please fill in all required fields';
                    errorMessage.classList.add('active');
                    input.focus();
                    return false;
                }

                if (input.type === 'email' && !isValidEmail(input.value)) {
                    errorMessage.textContent = 'Please enter a valid email address';
                    errorMessage.classList.add('active');
                    input.focus();
                    return false;
                }

                if (input.type === 'radio') {
                    const radioGroup = currentStepElement.querySelectorAll(`[name="${input.name}"]`);
                    const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                    if (!isChecked) {
                        errorMessage.textContent = 'Please select an option';
                        errorMessage.classList.add('active');
                        return false;
                    }
                }
            }

            return true;
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function collectFormData() {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            return data;
        }
        nextBtn.addEventListener("click", () => {
            if (!validateStep()) {
                return;
            }

            if (currentStep < totalSteps) {
                currentStep++;
                updateProgress();
                return;
            }

            if (hasSubmitted) {
                return;
            }

            hasSubmitted = true;
            nextBtn.disabled = true;
            prevBtn.disabled = true;
            nextBtn.textContent = "Submitting...";

            const formData = collectFormData();
            console.log("Form submitted:", formData);

            const emailBody = buildEstimateEmailBody();

            const settings = {
                url:
                    "https://api.juaninfotech.com/api/User/SendCookscapeEmail" +
                    "?Name=" +
                    encodeURIComponent($("#estimatefullName").val()) +
                    "&Email=" +
                    encodeURIComponent($("#estimateemailid").val()) +
                    "&Mobile=" +
                    encodeURIComponent($("#estimatephonenumber").val()) +
                    "&Subject=" +
                    encodeURIComponent("Quick Estimate Lead") +
                    "&Message=" +
                    encodeURIComponent(emailBody),
                method: "POST",
                timeout: 30000
            };

            function completeEstimateSubmission() {
                form.style.display = "none";
                document.querySelector(".progress-container").style.display = "none";
                document.querySelector(".button-group").style.display = "none";
                successMessage.classList.add("active");
            }

            $.ajax(settings)
                .done(function (response) {
                    console.log("Estimate submitted successfully:", response);
                    if (typeof window.fbq === "function") {
                        window.cookscapeAllowLeadPixel = true;
                        window.fbq("track", "Lead", {
                            content_name: "Quick Estimate Form",
                            content_category: "Free Estimate"
                        });
                        window.cookscapeAllowLeadPixel = false;
                    }
                    completeEstimateSubmission();
                })
                .fail(function (xhr, status, error) {
                    console.warn("Estimate submission failed:", status, error);

                    hasSubmitted = false;
                    nextBtn.disabled = false;
                    prevBtn.disabled = false;
                    nextBtn.textContent = "Submit";

                    errorMessage.textContent =
                        "Unable to submit your estimate. Please try again.";
                    errorMessage.classList.add("active");
                });
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateProgress();
            }
        });

        form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                nextBtn.click();
            }
        });

        updateProgress();

        $(document).on('click', '.btnModal', function () {
            resetFormProgress();
            $('#EnquiryModal').show().attr('aria-hidden', 'false');
        });
        $(document).on('click', '.close', function () {
            if ($(document.activeElement).closest('#EnquiryModal').length) {
                document.activeElement.blur();
            }
            resetFormProgress();
            $('#EnquiryModal').hide().attr('aria-hidden', 'true');
        });
 function resetFormProgress() {
    currentStep = 1;
    hasSubmitted = false;

    form.reset();
    updateProgress();

    nextBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.textContent = "Continue";

    errorMessage.classList.remove("active");
    successMessage.classList.remove("active");

    form.style.display = "block";
    document.querySelector(".progress-container").style.display = "block";
    document.querySelector(".button-group").style.display = "flex";
}
    }

    function initScripts() {
        // INTERIOR STYLE PRELOADER ANIMATION
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(".preloader.interior", {
                    y: "-100%", duration: 0.5, ease: "circ.out", onComplete: () => {
                        document.querySelector(".preloader.interior").style.display = "none";
                    }
                });
            }
        });

        tl.to(".preloader-logo", { opacity: 1, y: -10, duration: 1, ease: "power2.out" })
            .to(".preloader-text", { opacity: 1, y: -10, duration: 0.3, ease: "power2.out" }, "-=0.3")
            .to(".loading-bar span", { width: "100%", duration: 1, ease: "power2.inOut" })
            .to(".preloader-logo, .preloader-text, .loading-bar", { opacity: 0, y: -40, duration: 0.3, ease: "power2.in" });


        //Update Header Style and Scroll to Top
        function headerStyle() {
            if ($('.main-header').length) {
                var windowpos = $(window).scrollTop();
                var siteHeader = $('.main-header');
                var scrollLink = $('.scroll-to-top');

                var HeaderHight = $('.main-header').height();
                if (windowpos >= HeaderHight) {
                    siteHeader.addClass('fixed-header');
                    scrollLink.fadeIn(300);
                } else {
                    siteHeader.removeClass('fixed-header');
                    scrollLink.fadeOut(300);
                }

            }
        }

        headerStyle();


        //Submenu Dropdown Toggle
        if ($('.main-header li').length) {
            $('.main-header li.dropdown').append('<div class="dropdown-btn"><span class="fa fa-angle-down"></span></div>');

            //Dropdown Button
            $('.main-header li.dropdown .dropdown-btn').on('click', function () {
                $(this).prev('ul').slideToggle(500);
            });

            //Disable dropdown parent link
            $('.navigation li.dropdown > a').on('click', function (e) {
                e.preventDefault();
            });

            //Disable dropdown parent link
            $('.main-header .navigation li.dropdown > a,.hidden-bar .side-menu li.dropdown > a').on('click', function (e) {
                e.preventDefault();
            });

            $('.main-menu .navigation > li .mega-menu-bar > .column > ul').addClass('first-ul');
            $('.main-header .main-menu .navigation > li > ul').addClass('last-ul');

            $('.xs-sidebar-group .close-button').on('click', function (e) {
                $('.xs-sidebar-group.info-group').removeClass('isActive');
            });

            $('.about-widget').on('click', function (e) {
                $('.about-sidebar').addClass('active');
            });

            $('.about-sidebar .close-button').on('click', function (e) {
                $('.about-sidebar').removeClass('active');
            });

            $('.about-sidebar .gradient-layer').on('click', function (e) {
                $('.about-sidebar').removeClass('active');
            });

            // Pricing Button
            $('.pricing-tabs .tab-buttons .yearly').on('click', function () {
                $('.round').addClass('boll-right');
            });

            // Pricing Button
            $('.pricing-tabs .tab-buttons .monthly').on('click', function () {
                $('.round').removeClass('boll-right');
            });

        }


        //Mobile Nav Hide Show
        if ($('.mobile-menu').length) {
            //$('.mobile-menu .menu-box').mCustomScrollbar();
            var mobileMenuContent = $('.main-header .nav-outer .main-menu').html();
            $('.mobile-menu .menu-box .menu-outer').append(mobileMenuContent);
            $('.sticky-header .main-menu').append(mobileMenuContent);

            //Hide / Show Submenu
            $('.mobile-menu .navigation > li.dropdown > .dropdown-btn').on('click', function (e) {
                console.log('btn clicked');
                e.preventDefault();
                var target = $(this).parent('li').children('ul');
                var target1 = $(this).parent('li').children('div.mega-menu');
                // console.log('target', $(target).is(':visible'));
                console.log('target1', $(target1).is(':visible'));

                if ($(target).is(':visible')) {
                    $(this).parent('li').removeClass('open');
                    $(target).slideUp(500);
                    $(this).parents('.navigation').children('li.dropdown').removeClass('open');
                    $(this).parents('.navigation').children('li.dropdown > ul.last-ul').slideUp(500);
                    return false;
                } else {
                    $(this).parents('.navigation').children('li.dropdown').removeClass('open');
                    $(this).parents('.navigation').children('li.dropdown').children('ul.last-ul').slideUp(500);
                    $(this).parent('li').toggleClass('open');
                    $(this).parent('li').children('ul.last-ul').slideToggle(500);
                }
                if ($(target1).is(':visible')) {
                    console.log('Visible');
                    $(this).parent('li').removeClass('open');
                    $(target1).slideUp(500);
                    $(this).parents('.navigation').children('li.dropdown').removeClass('open');
                    $(this).parents('.navigation').children('li.dropdown > .mega-menu').slideUp(500);
                    // return false;
                } else {
                    console.log('Not Visible');
                    $(this).parents('.navigation').children('li.dropdown').removeClass('open');
                    $(this).parents('.navigation').children('li.dropdown').children('.mega-menu').slideUp(500);
                    $('.first-ul').css('display', 'block');
                    $(this).parent('li').toggleClass('open');
                    $(this).parent('li').children('.mega-menu').slideToggle(500);
                }
            });


            //3rd Level Nav
            $('.mobile-menu .navigation > li.dropdown > ul  > li.dropdown > .dropdown-btn').on('click', function (e) {
                e.preventDefault();
                var targetInner = $(this).parent('li').children('ul');

                if ($(targetInner).is(':visible')) {
                    $(this).parent('li').removeClass('open');
                    $(targetInner).slideUp(500);
                    $(this).parents('.navigation > ul').find('li.dropdown').removeClass('open');
                    $(this).parents('.navigation > ul').find('li.dropdown > ul').slideUp(500);
                    return false;
                } else {
                    $(this).parents('.navigation > ul').find('li.dropdown').removeClass('open');
                    $(this).parents('.navigation > ul').find('li.dropdown > ul').slideUp(500);
                    $(this).parent('li').toggleClass('open');
                    $(this).parent('li').children('ul').slideToggle(500);
                }
            });

            //Menu Toggle Btn
            $('.mobile-nav-toggler').on('click', function () {
                $('body').addClass('mobile-menu-visible');
                $('.menu-outer').html('<div class="navbar-collapse collapse clearfix" id="navbarSupportedContent"> ' +
                    $('#navbarContent').html()
                    + ' </div>');
            });

            
                document.addEventListener("click", function (e) {

                    let btn = e.target.closest(".menu-outer .dropdown-btn");
                    let link = e.target.closest(".menu-outer .navigation .dropdown > a");

                    if (btn || link) {
                        e.preventDefault();
                        e.stopImmediatePropagation();

                        let menu = (btn || link).closest(".dropdown");

                        document.querySelectorAll(".menu-outer .dropdown.open").forEach(function (el) {
                            if (el !== menu) el.classList.remove("open");
                        });

                        menu.classList.toggle("open");
                    }

                }, true);

            //Menu Toggle Btn
            $('.mobile-menu .menu-backdrop,.mobile-menu .close-btn').on('click', function () {
                $('body').removeClass('mobile-menu-visible');
                $('.mobile-menu .navigation > li').removeClass('open');
                $('.mobile-menu .navigation li ul').slideUp(0);
            });

            $(document).keydown(function (e) {
                if (e.keyCode == 27) {
                    $('body').removeClass('mobile-menu-visible');
                    $('.mobile-menu .navigation > li').removeClass('open');
                    $('.mobile-menu .navigation li ul').slideUp(0);
                }
            });

        }
        // Folks animation
        let endTl = gsap.timeline({
            repeat: -1,
            delay: 0.5,
            scrollTrigger: {
                trigger: '.up-down_animation',
                start: 'bottom 100%-=50px'
            }
        });
        gsap.set('.up-down_animation', {
            opacity: 0
        });
        gsap.to('.up-down_animation', {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.up-down_animation',
                start: 'bottom 100%-=50px',
                once: true
            }
        });
        let mySplitText = new SplitText(".up-down_animation", { type: "" });
        let chars = mySplitText.chars;
        //let endGradient = chroma.scale(['#F9D371', '#F47340', '#EF2F88', '#8843F2']);
        endTl.to(chars, {
            duration: 0.5,
            scaleY: 0.6,
            ease: "power3.out",
            stagger: 0.04,
            transformOrigin: 'center bottom'
        });
        endTl.to(chars, {
            yPercent: -20,
            ease: "elastic",
            stagger: 0.03,
            duration: 0.8
        }, 0.5);
        endTl.to(chars, {
            scaleY: 1,
            ease: "elastic.out(2.5, 0.2)",
            stagger: 0.03,
            duration: 1.5
        }, 0.5);
        endTl.to(chars, {
            //color: (i, el, arr) => {
            //return endGradient(i / arr.length).hex();
            //},
            ease: "power2.out",
            stagger: 0.03,
            duration: 0.3
        }, 0.5);
        endTl.to(chars, {
            yPercent: 0,
            ease: "back",
            stagger: 0.03,
            duration: 0.8
        }, 0.7);
        endTl.to(chars, {
            //color: '#ff5c00',
            duration: 1.4,
            stagger: 0.05
        });
        /////////////////////////////////////////////////////





        //Add One Page nav
        if ($('.scroll-nav').length) {
            $('.scroll-nav ul').onePageNav();
        }


        //Custom Scroll Linsk / Sidebar
        if ($('.scroll-nav li a').length) {
            $(".scroll-nav li a").on('click', function (e) {
                e.preventDefault();
                $('body').removeClass('mobile-menu-visible');
            });
        }



        //Header Search
        if ($('.search-box-outer').length) {
            $('.search-box-outer').on('click', function () {
                $('body').addClass('search-active');
            });
            $('.close-search').on('click', function () {
                $('body').removeClass('search-active');
            });
        }



        // Testimonial Section Four Carousel
        if ($('.shop-detail').length) {
            var thumbsCarousel = new Swiper('.shop-detail .thumbs-carousel', {
                spaceBetween: 15,
                slidesPerView: 4,
                //direction: 'vertical',
                breakpoints: {
                    320: {
                        //direction: 'horizontal',
                        slidesPerView: 3,
                    },
                    640: {
                        //direction: 'horizontal',
                        slidesPerView: 4,
                    },
                    1023: {
                        slidesPerView: 4,
                    }

                }
            });

            var contentCarousel = new Swiper('.shop-detail .content-carousel', {
                spaceBetween: 0,
                loop: true,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                thumbs: {
                    swiper: thumbsCarousel
                },
            });
        }



        //Jquery Spinner / Quantity Spinner
        if ($('.qty-spinner').length) {
            $("input.qty-spinner").TouchSpin({
                verticalbuttons: true
            });
        }


        //Custom Seclect Box
        if ($('.custom-select-box').length) {
            $('.custom-select-box').selectmenu().selectmenu('menuWidget').addClass('overflow');
        }



        // Title Animation
        let splitTitleLines = gsap.utils.toArray(".title-anim");

        splitTitleLines.forEach(splitTextLine => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: splitTextLine,
                    start: 'top 90%',
                    end: 'bottom 60%',
                    scrub: false,
                    markers: false,
                    toggleActions: 'play none none none'
                }
            });

            const itemSplitted = new SplitText(splitTextLine, { type: "words, lines" });
            gsap.set(splitTextLine, { perspective: 400 });
            itemSplitted.split({ type: "lines" })
            tl.from(itemSplitted.lines, { duration: 1, delay: 0.3, opacity: 0, rotationX: -80, force3D: true, transformOrigin: "top center -50", stagger: 0.1 });
        });




        // Main Slider
        if ($('.main-slider').length) {
            var slider = new Swiper('.main-slider', {
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                centeredSlides: true,
                observer: true,
                observeParents: true,
                autoplay: {
                    enabled: true,
                    delay: 4000,
                },
                // Navigation arrows
                navigation: {
                    nextEl: '.main-slider-next',
                    prevEl: '.main-slider-prev',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".slider-one_pagination",
                    clickable: true,
                    renderBullet: function (index, className) {
                        let formattedIndex = (index + 1).toString().padStart(2, '0'); // Ensures two-digit format
                        return '<span class="' + className + '">' + formattedIndex + "</span>";
                    },
                },
                speed: 1500,
                breakpoints: {
                    '1600': {
                        slidesPerView: 1,
                    },
                    '1200': {
                        slidesPerView: 1,
                    },
                    '992': {
                        slidesPerView: 1,
                    },
                    '768': {
                        slidesPerView: 1,
                    },
                    '576': {
                        slidesPerView: 1,
                    },
                    '0': {
                        slidesPerView: 1,
                    },
                },
            });
        }




        // Single One Slider
        if ($('.single-item_carousel').length) {
            var slider = new Swiper('.single-item_carousel', {
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                autoplay: {
                    enabled: true,
                    delay: 6000
                },
                // Navigation arrows
                navigation: {
                    nextEl: '.single-item_carousel-next',
                    prevEl: '.single-item_carousel-prev',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".single-item_carousel-pagination",
                    clickable: true,
                },
                speed: 1500,
                breakpoints: {
                    '1600': {
                        slidesPerView: 1,
                    },
                    '1200': {
                        slidesPerView: 1,
                    },
                    '992': {
                        slidesPerView: 1,
                    },
                    '768': {
                        slidesPerView: 1,
                    },
                    '576': {
                        slidesPerView: 1,
                    },
                    '0': {
                        slidesPerView: 1,
                    },
                },
            });
        }



        // three Items Slider
        if ($('.three-item_carousel').length) {
            var slider = new Swiper('.three-item_carousel', {
                slidesPerView: 3,
                spaceBetween: 25,
                loop: true,
                autoplay: {
                    enabled: true,
                    delay: 6000
                },
                // Navigation arrows
                navigation: {
                    nextEl: '.three-item_carousel-next',
                    prevEl: '.three-item_carousel-prev',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".three-item_carousel-pagination",
                    clickable: true,
                    type: "progressbar",
                },
                speed: 1500,
                breakpoints: {
                    '1600': {
                        slidesPerView: 3,
                    },
                    '1200': {
                        slidesPerView: 3,
                    },
                    '992': {
                        slidesPerView: 2,
                    },
                    '768': {
                        slidesPerView: 2,
                    },
                    '576': {
                        slidesPerView: 1,
                    },
                    '0': {
                        slidesPerView: 1,
                    },
                },
            });
        }



        // Projects Item Carousel
        if ($('.projects-item-carousel').length) {
            var slider = new Swiper('.projects-item-carousel', {
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                autoplay: {
                    enabled: true,
                    delay: 6000,
                },
                // Navigation arrows
                navigation: {
                    nextEl: '.projects-item-carousel-next',
                    prevEl: '.projects-item-carousel-prev',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".projects-item-carousel_pagination",
                    clickable: true,
                    renderBullet: function (index, className) {
                        let formattedIndex = (index + 1).toString().padStart(2, '0'); // Ensures two-digit format
                        return '<span class="' + className + '">' + formattedIndex + "</span>";
                    },
                },
                speed: 1500,
                breakpoints: {
                    '1600': {
                        slidesPerView: 1,
                    },
                    '1200': {
                        slidesPerView: 1,
                    },
                    '992': {
                        slidesPerView: 1,
                    },
                    '768': {
                        slidesPerView: 1,
                    },
                    '576': {
                        slidesPerView: 1,
                    },
                    '0': {
                        slidesPerView: 1,
                    },
                },
            });
        }




        // Testimonial Swiper
        if ($('.testimonial-swiper').length) {
            var swiper = new Swiper(".testimonial-swiper", {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                centeredSlides: true,

                // Navigation arrows
                navigation: {
                    nextEl: '.testimonial-swiper-next',
                    prevEl: '.testimonial-swiper-prev',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".testimonial-swiper-pagination",
                    clickable: true,
                    type: "progressbar",
                },

                speed: 1500,
                breakpoints: {
                    1500: {
                        slidesPerView: 1,
                    },
                    1200: {
                        slidesPerView: 1,
                    },
                    1000: {
                        slidesPerView: 1,
                    },
                    970: {
                        slidesPerView: 1,
                    },
                    650: {
                        slidesPerView: 1,
                    },
                    480: {
                        slidesPerView: 1,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
            });
        }




        // Clients Slider
        if ($('.clients_slider').length) {
            var slider = new Swiper('.clients_slider', {
                slidesPerView: 4,
                spaceBetween: 10,
                loop: true,
                autoplay: {
                    enabled: true,
                    delay: 6000
                },
                // Navigation arrows
                navigation: {
                    nextEl: '.clients_slider-button-next',
                    prevEl: '.clients_slider-button-prev',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".clients_slider-pagination",
                    clickable: true,
                },
                speed: 1500,
                breakpoints: {
                    '1600': {
                        slidesPerView: 4,
                    },
                    '1200': {
                        slidesPerView: 4,
                    },
                    '992': {
                        slidesPerView: 4,
                    },
                    '768': {
                        slidesPerView: 3,
                    },
                    '576': {
                        slidesPerView: 2,
                    },
                    '0': {
                        slidesPerView: 1,
                    },
                },
            });
        }





        // Instagram One Slider
        if ($('.instagram-one_carousel').length) {
            var slider = new Swiper('.instagram-one_carousel', {
                slidesPerView: 5,
                spaceBetween: 0,
                loop: true,
                autoplay: {
                    enabled: true,
                    delay: 6000
                },
                // Navigation arrows
                navigation: {
                    nextEl: '.instagram-one_next-arrow',
                    prevEl: '.instagram-one_prev-arrow',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".instagram-one_carousel-pagination",
                    clickable: true,
                },
                speed: 500,
                breakpoints: {
                    '1600': {
                        slidesPerView: 5,
                    },
                    '1200': {
                        slidesPerView: 5,
                    },
                    '992': {
                        slidesPerView: 4,
                    },
                    '768': {
                        slidesPerView: 4,
                    },
                    '576': {
                        slidesPerView: 3,
                    },
                    '0': {
                        slidesPerView: 2,
                    },
                },
            });
        }





        // Projects Slider
        if ($('.projects_carousel').length) {
            var slider = new Swiper('.projects_carousel', {
                slidesPerView: 4,
                spaceBetween: 20,
                loop: true,
                autoplay: {
                    enabled: true,
                    delay: 6000
                },
                // Navigation arrows
                navigation: {
                    nextEl: '.projects_carousel_next-arrow',
                    prevEl: '.projects_carousel_prev-arrow',
                    clickable: true,
                },
                //Pagination
                pagination: {
                    el: ".projects_carousel-pagination",
                    clickable: true,
                },
                speed: 1500,
                breakpoints: {
                    '1600': {
                        slidesPerView: 5,
                    },
                    '1400': {
                        slidesPerView: 4,
                    },
                    '1200': {
                        slidesPerView: 3,
                    },
                    '992': {
                        slidesPerView: 3,
                    },
                    '768': {
                        slidesPerView: 2,
                    },
                    '576': {
                        slidesPerView: 2,
                    },
                    '0': {
                        slidesPerView: 1,
                    },
                },
            });
        }




        // Image Reveal Animation  used
        let imgs_reveal = document.querySelectorAll(".img-reveal");

        imgs_reveal.forEach((container) => {
            let image = container.querySelector("img");
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    toggleActions: "restart none none reset"
                }
            });

            tl.set(container, { autoAlpha: 1 });
            tl.from(container, 1.5, {
                xPercent: -100,
                ease: Power2.out
            });
            tl.from(image, 1.5, {
                xPercent: 100,
                scale: 1.3,
                delay: -1.5,
                ease: Power2.out
            });
        });





        // Accordion Box
        if ($('.accordion-box').length) {
            $(".accordion-box").on('click', '.acc-btn', function () {

                var outerBox = $(this).parents('.accordion-box');
                var target = $(this).parents('.accordion');
                var accContent = $(this).next('.acc-content');

                if ($(this).hasClass('active')) {
                    // If already open, close it
                    $(this).removeClass('active');
                    target.removeClass('active-block');
                    accContent.slideUp(300);
                } else {
                    // Open clicked accordion
                    $(outerBox).find('.accordion .acc-btn').removeClass('active');
                    $(outerBox).children('.accordion').removeClass('active-block');
                    $(outerBox).find('.accordion .acc-content').slideUp(300);

                    $(this).addClass('active');
                    target.addClass('active-block');
                    accContent.slideDown(300);
                }
            });
        }





        let imgs_reveal_two = document.querySelectorAll(".img-reveal_two");

        imgs_reveal_two.forEach((container) => {
            let image = container.querySelector("img");
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    toggleActions: "restart none none reset"
                }
            });

            tl.set(container, { autoAlpha: 1 });

            // container comes in from the right
            tl.from(container, 1.5, {
                xPercent: 100, // ← flipped
                ease: Power2.out
            });

            // image slides in from the left
            tl.from(image, 1.5, {
                xPercent: -100, // ← flipped
                scale: 1.3,
                delay: -1.5,
                ease: Power2.out
            });
        });




        // Helper function to move image
        function followImageCursor(event, item, childIndex) {
            const contentBox = item.getBoundingClientRect();
            const dx = event.clientX - contentBox.x;
            const dy = event.clientY - contentBox.y;
            item.children[childIndex].style.transform = `translate(${dx}px, ${dy}px)`;
        }

        // Debounce function to prevent excessive triggering
        function debounce(fn, delay) {
            let frame;
            return function (...args) {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => fn.apply(this, args));
            };
        }

        // Apply for .service-block_two-inner
        document.querySelectorAll(".service-block_two-inner").forEach((item) => {
            item.addEventListener(
                "mousemove",
                debounce((event) => followImageCursor(event, item, 3), 16)
            );
        });



        //Gallery Filters
        if ($('.filter-list').length) {
            $('.filter-list').mixItUp({});
        }


        //Progress Bar
        if ($('.progress-line').length) {
            $('.progress-line').appear(function () {
                var el = $(this);
                var percent = el.data('width');
                $(el).css('width', percent + '%');
            }, { accY: 0 });
        }



        //Fact Counter + Text Count
        if ($('.count-box').length) {
            $('.count-box').appear(function () {

                var $t = $(this),
                    n = $t.find(".count-text").attr("data-stop"),
                    r = parseInt($t.find(".count-text").attr("data-speed"), 10);

                if (!$t.hasClass("counted")) {
                    $t.addClass("counted");
                    $({
                        countNum: $t.find(".count-text").text()
                    }).animate({
                        countNum: n
                    }, {
                        duration: r,
                        easing: "linear",
                        step: function () {
                            $t.find(".count-text").text(Math.floor(this.countNum));
                        },
                        complete: function () {
                            $t.find(".count-text").text(this.countNum);
                        }
                    });
                }

            }, { accY: 0 });
        }



        if ($('.clock-wrapper').length) {
            (function () {
                //generate clock animations
                var now = new Date(),
                    hourDeg = now.getHours() / 12 * 360 + now.getMinutes() / 60 * 30,
                    minuteDeg = now.getMinutes() / 60 * 360 + now.getSeconds() / 60 * 6,
                    secondDeg = now.getSeconds() / 60 * 360,
                    stylesDeg = [
                        "@-webkit-keyframes rotate-hour{from{transform:rotate(" + hourDeg + "deg);}to{transform:rotate(" + (hourDeg + 360) + "deg);}}",
                        "@-webkit-keyframes rotate-minute{from{transform:rotate(" + minuteDeg + "deg);}to{transform:rotate(" + (minuteDeg + 360) + "deg);}}",
                        "@-webkit-keyframes rotate-second{from{transform:rotate(" + secondDeg + "deg);}to{transform:rotate(" + (secondDeg + 360) + "deg);}}",
                        "@-moz-keyframes rotate-hour{from{transform:rotate(" + hourDeg + "deg);}to{transform:rotate(" + (hourDeg + 360) + "deg);}}",
                        "@-moz-keyframes rotate-minute{from{transform:rotate(" + minuteDeg + "deg);}to{transform:rotate(" + (minuteDeg + 360) + "deg);}}",
                        "@-moz-keyframes rotate-second{from{transform:rotate(" + secondDeg + "deg);}to{transform:rotate(" + (secondDeg + 360) + "deg);}}"
                    ].join("");
                document.getElementById("clock-animations").innerHTML = stylesDeg;
            })();
        }




        // CURSOR
        var cursor = $(".cursor"),
            follower = $(".cursor-follower");

        var posX = 0,
            posY = 0;

        var mouseX = 0,
            mouseY = 0;

        TweenMax.to({}, 0.016, {
            repeat: -1,
            onRepeat: function () {
                posX += (mouseX - posX) / 9;
                posY += (mouseY - posY) / 9;

                TweenMax.set(follower, {
                    css: {
                        left: posX - 12,
                        top: posY - 12
                    }
                });

                TweenMax.set(cursor, {
                    css: {
                        left: mouseX,
                        top: mouseY
                    }
                });
            }
        });

        $(document).on("mousemove", function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        //circle
        $(".theme-btn, a").on("mouseenter", function () {
            cursor.addClass("active");
            follower.addClass("active");
        });
        $(".theme-btn, a").on("mouseleave", function () {
            cursor.removeClass("active");
            follower.removeClass("active");
        });
        // CURSOR End	



        // LightBox Image
        if ($('.lightbox-image').length) {
            $('.lightbox-image').magnificPopup({
                type: 'image',
                gallery: {
                    enabled: true
                }
            });
        }



        // LightBox Video
        if ($('.lightbox-video').length) {
            $('.lightbox-video').magnificPopup({
                // disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                iframe: {
                    patterns: {
                        youtube: {
                            index: 'youtube.com',
                            id: 'v=',
                            src: 'https://www.youtube.com/embed/%id%'
                        },
                    },
                    srcAction: 'iframe_src',
                },
                fixedContentPos: false
            });
        }



        //Product Tabs
        if ($('.project-tab').length) {
            $('.project-tab .product-tab-btns .p-tab-btn').on('click', function (e) {
                e.preventDefault();
                var target = $($(this).attr('data-tab'));

                if ($(target).hasClass('actve-tab')) {
                    return false;
                } else {
                    $('.project-tab .product-tab-btns .p-tab-btn').removeClass('active-btn');
                    $(this).addClass('active-btn');
                    $('.project-tab .p-tabs-content .p-tab').removeClass('active-tab');
                    $(target).addClass('active-tab');
                }
            });
        }



        // Tabs Box
        if ($('.tabs-box').length) {
            $('.tabs-box .tab-buttons .tab-btn').on('click', function (e) {
                e.preventDefault();
                var target = $($(this).attr('data-tab'));

                if ($(target).is(':visible')) {
                    return false;
                } else {
                    target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
                    $(this).addClass('active-btn');
                    target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
                    target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab');
                    $(target).fadeIn(300);
                    $(target).addClass('active-tab');
                }
            });
        }




        //contact.html Form Validation
        if ($('#contact-form').length) {
            $('#contact-form').validate({
                rules: {
                    username: {
                        required: true
                    },
                    lastname: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true
                    },
                    services: {
                        required: true
                    },
                    message: {
                        required: true
                    }
                }
            });
        }



        // Scroll to a Specific Div
        if ($('.scroll-to-target').length) {
            $(".scroll-to-target").on('click', function () {
                var target = $(this).attr('data-target');
                // animate
                $('html, body').animate({
                    scrollTop: $(target).offset().top
                }, 1500);

            });
        }



        // Elements Animation
        if ($('.wow').length) {
            var wow = new WOW(
                {
                    boxClass: 'wow',      // animated element css class (default is wow)
                    animateClass: 'animated', // animation css class (default is animated)
                    offset: 0,          // distance to the element when triggering the animation (default is 0)
                    mobile: true,       // trigger animations on mobile devices (default is true)
                    live: true       // act on asynchronously loaded content (default is true)
                }
            );
            wow.init();
        }



        /* ==========================================================================
           When document is Scrollig, do
           ========================================================================== */

        $(window).on('scroll', function () {
            headerStyle();
        });

        /* ==========================================================================
           When document is loading, do
           ========================================================================== */

        $(window).on('load', function () {

        });
    }
})(window.jQuery);