

(function() {

   

    // Variables to use later
    var rangeWrapper = document.querySelector('.range__wrapper');
    var rangeInput = document.querySelector('.range__input');
    var rangeValues = document.querySelector('.range__values');
    var rangeValueNumberTop = document.querySelector('.range__value__number--top');
    var rangeValueNumberBottom = document.querySelector('.range__value__number--bottom');
    var rangeSliderPaths = document.querySelectorAll('.range__slider__path');
    var mouseX = 0;
    var mouseY = 0;
    var mouseInitialY = 0;
    var mouseDy = 0;
    var mouseDyLimit = 150;
    var mouseDyFactor = 3;
    var max = 100;
    var rangeMin = parseInt(rangeInput.min);
    var rangeMax = parseInt(rangeInput.max);
    var rangeValue = parseInt(rangeInput.value);
    var rangeHeight = 500;
    var currentY = rangeHeight * rangeValue / max;
    var rangeMinY = rangeHeight * rangeMin / max;
    var rangeMaxY = rangeHeight * rangeMax / max;
    var scaleMax = 0.32;
    var scale, newPath, newY, newSliderY, lastMouseDy, rangeWrapperLeft, pageX, pageY;

    // স্লাইডার মান আপডেট করুন, প্রাথমিকভাবে `ইনপুট` মান ব্যবহার করে
    updateValue();

    // প্রদত্ত `dy` এবং `ty` মান ব্যবহার করে স্লাইডার `পাথ` তৈরি করার ফাংশন
    function buildPath(dy, ty) {
        return 'M 0 ' + ty + ' q ' + mouseX + ' ' + dy + ' 320 0 l 0 500 l -320 0 Z';
    }

    // স্লাইডার মান আপডেট করার ফাংশন
    function updateValue() {
    // এখনও চলমান থাকলে অ্যানিমেশনগুলি সাফ করুন
        anime.remove([rangeValues, rangeSliderPaths[0], rangeSliderPaths[1]]);

        // Calc the `input` value using the current `y`
        rangeValue = parseInt(currentY * max / rangeHeight);
        // Calc `scale` value for numbers
        scale = (rangeValue - rangeMin) / (rangeMax - rangeMin) * scaleMax;
        // Update `input` value
        rangeInput.value = rangeValue;
        // Update numbers values
        rangeValueNumberTop.innerText = max - rangeValue;
        rangeValueNumberBottom.innerText = rangeValue;
        // Translate range values
        rangeValues.style.transform = 'translateY(' + (rangeHeight - currentY) + 'px)';
        // Apply corresponding `scale` to numbers
        rangeValueNumberTop.style.transform = 'scale(' + (1 - scale) + ')';
        rangeValueNumberBottom.style.transform = 'scale(' + (1 - (scaleMax - scale)) + ')';

        // Some maths calc
        if (Math.abs(mouseDy) < mouseDyLimit) {
            lastMouseDy = mouseDy;
        } else {
            lastMouseDy = mouseDy < 0 ? -mouseDyLimit : mouseDyLimit;
        }

        // স্লাইডার `পথ` তৈরি করতে `newSliderY` মান গণনা করুন
        newSliderY = currentY + lastMouseDy / mouseDyFactor;
        if (newSliderY < rangeMinY || newSliderY > rangeMaxY) {
            newSliderY = newSliderY < rangeMinY ? rangeMinY : rangeMaxY;
        }

        // `পথ` স্ট্রিং তৈরি করুন এবং `পথ` উপাদান আপডেট করুন
        newPath = buildPath(lastMouseDy, rangeHeight - newSliderY);
        rangeSliderPaths[0].setAttribute('d', newPath);
        rangeSliderPaths[1].setAttribute('d', newPath);
    }

   // স্থিতিস্থাপক আচরণ অনুকরণ ফাংশন
    function elasticRelease() {
       // একটি শক্তিশালী স্থিতিস্থাপকতা অনুকরণ করতে, বিপরীত দিকের পথগুলিকে রূপান্তর করুন
        anime({
            targets: rangeSliderPaths,
            d: buildPath(-lastMouseDy * 1.3, rangeHeight - (currentY - lastMouseDy / mouseDyFactor)),
            duration: 150,
            easing: 'linear',
            complete: function () {
              // 'ইলাস্টিকআউট' ইজিং ফাংশন (ডিফল্ট) ব্যবহার করে স্বাভাবিক অবস্থায় পাথগুলিকে রূপান্তর করুন
                anime({
                    targets: rangeSliderPaths,
                    d: buildPath(0, rangeHeight - currentY),
                    duration: 4000,
                    elasticity: 900
                });
            }
        });

        // একটি শক্তিশালী স্থিতিস্থাপকতা অনুকরণ করতে মানগুলিকে বিপরীত দিকে অনুবাদ করুন
        anime({
            targets: rangeValues,
            translateY: rangeHeight - (currentY + lastMouseDy / mouseDyFactor / 4),
            duration: 150,
            easing: 'linear',
            complete: function () {
             // `ইলাস্টিকআউট` ইজিং ফাংশন ব্যবহার করে মানগুলিকে সঠিক অবস্থানে অনুবাদ করুন (ডিফল্ট)
                anime({
                    targets: rangeValues,
                    translateY: rangeHeight - currentY,
                    duration: 4000,
                    elasticity: 810
                });
            }
        });
    }

    // `মাউসডাউন` এবং `টাচস্টার্ট` ইভেন্টগুলি পরিচালনা করুন, মাউসের অবস্থান সম্পর্কে ডেটা সংরক্ষণ করুন
    function mouseDown(e) {
        mouseY = mouseInitialY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
        rangeWrapperLeft = rangeWrapper.getBoundingClientRect().left;
    }

   // `মাউসমুভ` এবং `টাচমুভ` ইভেন্টগুলি পরিচালনা করুন, স্লাইডার `পাথ`কে রূপ দিতে মান গণনা করুন এবং মানগুলিকে সঠিকভাবে অনুবাদ করুন
    function mouseMove(e) {
        if (mouseY) {
            pageX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX;
            pageY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
            mouseX = pageX - rangeWrapperLeft;
            mouseDy = (pageY - mouseInitialY) * mouseDyFactor;
            newY = currentY + mouseY - pageY;
            if (newY >= rangeMinY && newY <= rangeMaxY) {
                currentY = newY;
                mouseY = pageY;
            } else {
                currentY = newY < rangeMinY ? rangeMinY : rangeMaxY;
            }
           // গণিত করার পরে, মান আপডেট করুন
            updateValue();
        }
    }

    // `মাউসআপ`, `মাউসলিভ` এবং `টাচএন্ড` ইভেন্টগুলি পরিচালনা করুন
    function mouseUp() {
       // `y` মান পরিবর্তিত হলে ইলাস্টিক অ্যানিমেশন ট্রিগার করুন
        if (mouseDy) {
            elasticRelease();
        }
        // Reset values
        mouseY = mouseDy = 0;
    }

    // Events listeners
    rangeWrapper.addEventListener('mousedown', mouseDown);
    rangeWrapper.addEventListener('touchstart', mouseDown);
    rangeWrapper.addEventListener('mousemove', mouseMove);
    rangeWrapper.addEventListener('touchmove', mouseMove);
    rangeWrapper.addEventListener('mouseup', mouseUp);
    rangeWrapper.addEventListener('mouseleave', mouseUp);
    rangeWrapper.addEventListener('touchend', mouseUp);

})();