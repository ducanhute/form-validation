function Validator(options) {
    // Hàm lấy ra thẻ cha là form-group
    function getParent(element, selector) {
        while (element.parentElement) {
            // Kiểm tra element có match với selector hay không
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    // Tạo object rỗng lưu tất cá rule, để tránh trình trạng ghì đè khi sử dụng nhiều rule cho một element
    var selectorRules = {}
    //Hàm thực hiện validate: Hiện thị message lỗi, truyền nội dụng lỗi muốn hiện thị vào thẻ span
    function validate(inputElement, rule) {
    // Ta đang đứng ở thẻ input, ta sẽ lấy ra thẻ cha của nó là form group và tiếp đến là lấy ra thẻ span chứa form-message
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        // Lấy ra các rule của một selector và ta sẽ lặp qua để validate
        var rules = selectorRules[rule.selector]
        var errorMessage 
        // Ta đang lặp qua rules( và phần tử lặp qua là các rule.test)
        for (var i = 0 ; i < rules.length; ++i) {           
            errorMessage = rules[i](inputElement.value)
            if(errorMessage) 
            // khi có lỗi thoát vòng lặp và nhận đc message đầu tiền tìm đc
                break
        }
            if(errorMessage) {
                errorElement.innerText = errorMessage;
                getParent(inputElement, options.formGroupSelector).classList.add('invalid')

            } else {
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }
            // !! convert sang boolean
            return !! errorMessage
    }
    
    // Lấy ra form element cần validate
    var formElement = document.querySelector(options.form)  ;
    if(formElement) {
        // Lắng nghe sự kiện onsubmit trên form
        formElement.onsubmit = function(e) {
            e.preventDefault ()
            var isFormValid = true
            // Khi nhấn submit thì validate tất cả các inputElement nên ta bỏ qua các lần lắng nghe sự kiện trên thẻ input
            options.rules.forEach( function (rule) {
                var inputElement  = formElement.querySelector(rule.selector)
                // console.log(rule)
                var isValid = validate(inputElement, rule)
                if(isValid) {
                    isFormValid = false
                }          
            })
            // Khi không có lỗi trả về data
            if(isFormValid) {
                // Trường hợp submit với hàm onsubmit
                if(typeof options.onsubmit === "function") {
                    // lấy ra tất cả element có attribute là fullname
                    var enableInputs = document.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce( function(values, input) {
                            values[input.name] = input.value
                            return values; // && kết quả return là values    
                    }, {})
                    options.onsubmit(formValues)
                } else {
                    formElement.submit()
                }
            }
        }
        // Ta lặp qua tất cả các rule: Từ selector của mỗi rule ta sẽ lấy đc element tương ứng và lắng nghe sự kiện trên các element đó: sau đó ta có thể làm gì tùy ý chúng ta
        options.rules.forEach( function (rule) {
            // Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            }
            // Lần thứ nhất  sẽ lọt vào else: gán cho bằng một cái mảng, Nếu có nhiều rule thì sẽ lọt lên if: rule tiếp theo sẽ đc push thêm vào mảng
            else {
                selectorRules[rule.selector] = [rule.test]
            }
            // Lấy ra Id của các thẻ input: rule.selector và từ đó lấy ra inputElement
            var inputElement  = formElement.querySelector(rule.selector)
        
            if(inputElement) {
                // Xử lý trường hợp blur ra khỏi input
                inputElement.onblur = function() {
                    // Đứng đây ta sẽ lấy đc value của thẻ ta blur: Người dùng nhập hay chưa: value = inputElement.value
                    // test func = rule.test
                    validate(inputElement, rule) // gọi hàm validate nhận vào element của thẻ input và hàm test             
                }
                // Xử lý mỗi khi người dùng nhập vào input: xóa errorMessage và màu đỏ của khung
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        })
    }
}

// Định nghĩa TẤT CẢ CÁC RULE các rule này sẽ đc hàm validator lặp qua
// Nguyên tắc của các rules
// 1. Khi có lỗi --> trả ra message lỗi
// 2. Khi không có lỗi --> ko trả ra gì: (undefined)
Validator.isRequired = function(selector, message) {
        return {
            selector: selector,
            // Hàm kiểm tra xem người dùng đã nhập chưa
            test: function(value) {
                // Trim loại bỏ tất cả dấu cách
                return value.trim() ? undefined : message || "Vui lòng nhập trường này"
            }
        }
}
Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        // Hàm kiểm tra xem có phải email hay không
        test: function(value) {
            regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || "Trường này phải là email"
        }
    }
}
Validator.minLegth = function(selector, min, message) {
    return {
        selector: selector,
        // Hàm kiểm tra 
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }   
}
Validator.isConfirmed = function(selector, getConfirmvalue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmvalue() ? undefined : message || `Giá trị nhập vào không chính xác`
        }
    }}

// Ý tưởng chạy của code:Khi sử dụng thư viện ta chỉ cần gọi hàm validator và truyền vào đối số là một object chứa các giá trị như
// id của form cần xử lý, các rule muốn thực hiện: Vd như: check email, check xác nhận mật khẩu
// Hàm validator, và các rule sẽ đc viết trong một file js riêng
// Các rule sẽ nhận vào có thể là custom_masssage và selector: thông tin của thẻ input mà ta muốn app dụng rule lên: có thể là id, class
// Các rule ta chỉ định nghĩa ra và để đó, hàm validator sẽ sử dụng phương thức forEach để lặp qua tất cả các rule mà ta đã định nghĩa(cá rule này đã đc bỏ vào một mảng và truyền vào đối số của hàm Validator thế nên từ hàm validator ta có thể lấy ra đc các rule này)
// Khi lặp qua các rule ta sẽ lấy ra đc các selector, hàm test của rule: từ đó lấy ra đc element, giá trị của element, lắng nghe sự kiện trên element và làm gì tùy ý chúng ta
// Ý tưởng sử dụng: Phương thức isConfirmed: nhận vào ba đố số: selector,custom_masssage và 1 function trả về giá trị của ô mật khẩu: giá trị nhận về sẽ đc đưa vào hàm test để so sánh
// CÁCH SỬ DỤNG NHIỀU RULE CHO MỘT Ô INPUT: nếu gán bằng thì rule sau sẽ ghì đè rule trước
// Cách sử lý là ta sẽ lưu lại tất cả các rule của nó để nó không bị ghì đè: Ta sẽ tạo ra một object: để lưu, mỗi phần tử của object sẽ tương ứng với mỗi selector
// selector nào có nhiều rule thì sẽ lưu lại dưới dạng mảng nhiều phần tử. Và khi gọi rule để validate ta sẽ lặp qua các rule có trong mảng: nếu có lỗi sẽ break vòng lặp và in ra message lỗi đầu tiền tìm đc
// Khi bấm submit: validate tất cả các inputElement và trả về data có trong form
// Trả về data khi nhấn submit: thứ nhất kiểm tra không có lỗi. và có custom hàm onsubmit truyền vào đối số của validator.Lấy ra tất cả các giá trị của thẻ input và gán vào 1 object có key là name của thẻ và value là value của thẻ 
// lưu ý 1: trường hợp getparent phải lấy ra thẻ cha form-group ngoài cùng rồi tìm đến thẻ cần thêm vào errorMessage( mặc cho thẻ này nằm bên trong bao nhiêu cấp)
// Hàm getParent() ta sẽ sử dụng vòng lặp vô hạn sử dụng element.match để kiểm tra element có match với selector hay không, nếu mathes thì thẻ maches đó
