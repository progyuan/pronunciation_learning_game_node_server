
function SignupController()
{
// redirect to homepage when cancel button is clicked //
	$('#account-form-btn1').click(function(){ window.location.href = BASEURL+'/';});

// redirect to homepage on new account creation, add short delay so user can read alert window //
	$('.modal-alert #ok').click(function(){ setTimeout(function(){window.location.href = BASEURL+'/';}, 300)});
}
