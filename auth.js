import {supabase} from './supabase-client.js';

const loginTabBtn = document.getElementById('loginTabBtn');
const signupTabBtn = document.getElementById('signupTabBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authNotice = document.getElementById('authNotice');

// redirect if already login 

async function checkExistingUser(){
    const {data} = await supabase.auth.getSession();

    // if user has a actve session i will send it to main paage

    if(data.session){
        window.location.href = 'index.html';
    }
}

checkExistingUser();

// switchin tabs logic 

loginTabBtn.addEventListener('click',function(){
    loginTabBtn.classList.add('active');
    signupTabBtn.classList.remove('active');

    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');

    hideNotice();
});

signupTabBtn.addEventListener('click',function(){
    signupTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');

    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');

    hideNotice();
});

// for showin/hidein notification msg nd 

function showNotice(message,isError){
    authNotice.textContent = message;

    if(isError){
        authNotice.className='auth-notice error';
    }else{
        authNotice.className='auth-notice success';
    }
}

function hideNotice(){
    authNotice.textContent='';
    authNotice.className='auth-notice hidden';
}

// validation helper

function isValidEmail(email){// for checkin @ nd .
    return email.includes('@') && email.includes('.');
}

function isValidPassword(passWord){
    const hasMinLength=passWord.length >=6;
    const hasUppercase=/[A-Z]/.test(passWord);
    const hasSymbol=/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passWord);

    return hasMinLength && hasUppercase && hasSymbol;
}

// login from submission

loginForm.addEventListener('submit',async function(event) {
    event.preventDefault();
    hideNotice();

    const email=document.getElementById('loginEmail').value.trim();
    const password=document.getElementById('loginPassword').value;

    if(!isValidEmail(email)){
        showNotice('please enter a valid email address',true);
        return;
    }

   

    // sendin req to supa

    const {error}=await supabase.auth.signInWithPassword({
        email:email,
        password: password
    });

    if(error){
        showNotice(error.message,true);
    }else{
        window.location.href='index.html';
    }
});

// sign up form

signupForm.addEventListener('submit',async function(event){
    event.preventDefault();
    hideNotice();

    const name= document.getElementById('signupName').value.trim();
    const email=document.getElementById('signupEmail').value.trim();
    const password=document.getElementById('signupPassword').value;

    // checkin inputs

    if(!isValidEmail(email)){
        showNotice('Please enter a valid email address.',true);
        return;
    }

    if(!isValidPassword(password)){
        showNotice('Password must be 6+ chars with 1 uppercase letter and 1 symbol.', true);
        return;
    }

    const {error} = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
        showNotice(error.message, true);
    } else {
        showNotice('Account created successfully! Redirecting...', false);
        
        setTimeout(function () {
            window.location.href = 'index.html';
        }, 1000);
    }
});