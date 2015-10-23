$(function(){
    var t_id;
    var $password = $('#password');
    var $password_confirm = $('#password-confirm');
    var submit_btn = $('#submit');
    $password_confirm.on('keypress', function(e){
        t_id = setTimeout(function(){
            console.log('checking...');
            if($password.val() !== $password_confirm.val()){
                $password_confirm.addClass('invalid');
                submit_btn[0].disabled = true;
            }
            else{
                $password_confirm.removeClass('invalid');
                submit_btn[0].disabled = false;
            }
        }, 1000);
    });
});