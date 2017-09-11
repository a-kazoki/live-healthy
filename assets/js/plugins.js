/*global $, angular, FB, console, language, lang, apiurl, alert, FormData*/
// resApp js
var myApp = angular.module("myApp", ["ngRoute", "ngCookies"]);

//routes js
myApp.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
    "use strict";
    $locationProvider.hashPrefix('');
    $routeProvider
        .when("/", {
            templateUrl : "assets/pages/" + lang + "/home.html",
            controller : "homeCtrl"
        })
        .when("/t&c", {
            templateUrl : "assets/pages/" + lang + "/terms-conditions.html",
            controller : "t&cCtrl"
        })
        .when("/about", {
            templateUrl : "assets/pages/" + lang + "/about.html",
            controller : "aboutCtrl"
        })
        .when("/doctors", {
            templateUrl : "assets/pages/" + lang + "/doctors.html",
            controller : "doctorsCtrl",
            authenticated : true
        })
        .when("/home_visit", {
            templateUrl : "assets/pages/" + lang + "/homeVisit.html",
            controller : "home_visitCtrl",
            authenticated : true
        })
        .when("/edit", {
            templateUrl : "assets/pages/" + lang + "/Edit.html",
            controller : "editCtrl",
            authenticated : true
        })
        .when("/profile", {
            templateUrl : "assets/pages/" + lang + "/profile.html",
            controller : "profileCtrl",
            authenticated : true
        })
        .when("/sub_profile", {
            templateUrl : "assets/pages/" + lang + "/subprofile.html",
            controller : "subprofileCtrl",
            authenticated : true
        })
        .otherwise({//variable
            templateUrl : "assets/pages/" + lang + "/redirect.html",
            controller : "redirectCtrl"
        });
}]);

myApp.run(["$rootScope", "$location", "authFact", function ($rootScope, $location, authFact) {
    "use strict";
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.$$route.authenticated) {
            var userAuth = authFact.getAccessToken();
            if (!userAuth) {
                $location.path("/");
            }
        }
    });
}]);

//authFact js
myApp.factory("authFact", ["$cookies", function ($cookies) {
    "use strict";
    var authFact = {};
    authFact.setAccessToken = function (accessToken) {
        $cookies.putObject('accessToken', accessToken);
    };
    authFact.getAccessToken = function () {
        authFact.authToken = $cookies.get("accessToken");
        return authFact.authToken;
    };
    return authFact;
}]);
//headerCtrl js
myApp.controller("headerCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //calender ready
    var d = 1,
        m = 1,
        y = 2017;
    $scope.dyasinmonth = [];
    $scope.monthsinyear = [];
    $scope.yearsrange = [];
    for (d; d <= 31; d = d + 1) {
        $scope.dyasinmonth.push(d);
    }
    for (m; m <= 12; m = m + 1) {
        $scope.monthsinyear.push(m);
    }
    for (y; y >= 1907; y = y - 1) {
        $scope.yearsrange.push(y);
    }
    //if already loged in
    $scope.userid = authFact.getAccessToken();
    if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
        $cookies.remove('accessToken');
        $scope.islogedin = false;
    } else {
        $scope.islogedin = true;
        //get user details
        $http({
            method: "GET",
            url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.patientdetails = response.data.Response;
                    $scope.subprofiles = response.data.Response.SubProfiles;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    }
    //goto page
    $scope.gotopage = function (x) {$('#regmodal').modal("hide"); $location.path("/" + x); };
    //login
    $scope.loginup = function () {
        $http({
            method: "POST",
            data: JSON.stringify({"Email": $scope.loginemail, "Password": $scope.loginpass, "lang": lang}),
            url: apiurl + "User/Login"
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    console.log(response.data.Response.UserDetails.User_ID);
                    console.log(response.headers().token);
                    $scope.username = response.data.Response.PatientDetails.Patient_Name;
                    $scope.errorlogin = false;
                    $scope.islogedin = true;
                    $cookies.putObject('Patient_ID', response.data.Response.PatientDetails.Patient_ID);
                    $cookies.putObject('User_ID', response.data.Response.UserDetails.User_ID);
                    authFact.setAccessToken(response.headers().token);
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                    $scope.errorlogin = true;
                    $scope.islogedin = false;
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //register
    $scope.upregister = function () {
        console.log($scope.regemail);
        console.log(document.getElementById("regimage").files[0]);
        console.log($scope.regpassword);
        console.log($scope.dob2 + "/" + $scope.dob1 + "/" + $scope.dob3);
        console.log($scope.regadd);
        console.log($scope.regmob);
        console.log($scope.regname);
        var form = new FormData();
        form.append("Image", document.getElementById("regimage").files[0]);
        form.append("Email", $scope.regemail);
        form.append("Password", $scope.regpassword);
        form.append("Age", "0");
        form.append("DOB", $scope.dob2 + "/" + $scope.dob1 + "/" + $scope.dob3);
        form.append("Address", $scope.regadd);
        form.append("Gender", $scope.reggender);
        form.append("Mobile_number", $scope.regmob);
        form.append("Name", $scope.regname);
        var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://yakensolution.cloudapp.net:80/LiveHealthy/api/user/Registration",
                "method": "POST",
                "headers": {
                    "cache-control": "no-cache",
                    "postman-token": "b6d5e1e4-011f-35f4-693b-8913a32bf14f"
                },
                "processData": false,
                "contentType": false,
                "mimeType": "multipart/form-data",
                "data": form
            };

        $.ajax(settings).done(function (response) {
            console.log(JSON.parse(response));
            console.log(JSON.parse(response).isSuccess);
            if (JSON.parse(response).isSuccess) {
                $http({
                    method: "POST",
                    data: JSON.stringify({"Email": $scope.regemail, "Password": $scope.regpassword, "lang": lang}),
                    url: apiurl + "User/Login"
                })
                    .then(function (response) {
                        if (response.data.isSuccess) {
                            console.log(response.data.Response);
                            console.log(response.data.Response.UserDetails.User_ID);
                            console.log(response.headers().token);
                            $scope.username = response.data.Response.PatientDetails.Patient_Name;
                            $scope.errorlogin = false;
                            $scope.islogedin = true;
                            $cookies.putObject('Patient_ID', response.data.Response.PatientDetails.Patient_ID);
                            $cookies.putObject('User_ID', response.data.Response.UserDetails.User_ID);
                            authFact.setAccessToken(response.headers().token);
                            location.reload();
                        } else {
                            $scope.errormsg = response.data.errorMessage;
                            console.log($scope.errormsg);
                            $scope.errorlogin = true;
                            $scope.islogedin = false;
                        }
                    }, function (reason) {
                        console.log(reason.data);
                    });
            }
        });
    };
    //subregister
    $scope.subregister = function () {
        var form = new FormData();
        form.append("Image", document.getElementById("subregimage").files[0]);
        form.append("Email", $scope.subregemail);
        form.append("Password", $scope.subregpass);
        form.append("Age", "0");
        form.append("DOB", $scope.subdob2 + "/" + $scope.subdob1 + "/" + $scope.subdob3);
        form.append("Address", $scope.subregadd);
        form.append("Gender", $scope.subreggender);
        form.append("Mobile_number", $scope.subregmob);
        form.append("Name", $scope.subregname);
        var settings = {
                "async": true,
                "crossDomain": true,
                "url": apiurl + "user/Registration",
                "method": "POST",
                "headers": {
                    "cache-control": "no-cache",
                    "postman-token": "b6d5e1e4-011f-35f4-693b-8913a32bf14f"
                },
                "processData": false,
                "contentType": false,
                "mimeType": "multipart/form-data",
                "data": form
            };

        $.ajax(settings).done(function (response) {
            console.log(JSON.parse(response));
            console.log(JSON.parse(response).isSuccess);
            if (JSON.parse(response).isSuccess) {
                //add sub profile
                $http({
                    method: "POST",
                    data: JSON.stringify({"ToPatient_ID": JSON.parse(response).Response.Patient_ID, "FromPatient_ID": JSON.parse($cookies.get("Patient_ID")), "lang": lang}),
                    url: apiurl + "Patient/AddSubProfile",
                    headers: {
                        "UserID": JSON.parse($cookies.get("User_ID")),
                        "Token": JSON.parse($cookies.get("accessToken"))
                    }
                })
                    .then(function (response) {
                        if (response.data.isSuccess) {
                            location.reload();
                        } else {
                            $scope.errormsg = response.data.errorMessage;
                            console.log(response.data);
                            console.log($scope.errormsg);
                        }
                    }, function (reason) {
                        console.log(reason.data);
                    });
            }
        });
    };
    //facebook register
    $scope.fbregister = function () {
        var form = new FormData();
        form.append("Image", document.getElementById("regimage").files[0]);
        form.append("Email", $scope.regemail);
        form.append("Age", "0");
        form.append("DOB", $scope.dob2 + "/" + $scope.dob1 + "/" + $scope.dob3);
        form.append("Address", $scope.regadd);
        form.append("Gender", $scope.reggender);
        form.append("Mobile_number", $scope.regmob);
        form.append("Name", $scope.regname);
        form.append("FB_ID", $scope.fbid);
        var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://yakensolution.cloudapp.net:80/LiveHealthy/api/user/Registration",
                "method": "POST",
                "headers": {
                    "cache-control": "no-cache",
                    "postman-token": "b6d5e1e4-011f-35f4-693b-8913a32bf14f"
                },
                "processData": false,
                "contentType": false,
                "mimeType": "multipart/form-data",
                "data": form
            };

        $.ajax(settings).done(function (response) {
            console.log(response);
            console.log(JSON.parse(response));
            console.log(JSON.parse(response).isSuccess);
            if (JSON.parse(response).isSuccess) {
                $scope.FBLogin();
            }
        });
    };
    //facebook ready
    window.fbAsyncInit = function () {
        FB.init({
            appId      : '128462914388023',
            cookie     : false,
            xfbml      : true,
            version    : 'v2.8'
        });
        FB.AppEvents.logPageView();
    };
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return; }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    //facebook login
    $scope.FBLogin = function () {
        FB.login(function (response) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', {fields: 'id,name,email,birthday,picture,gender'}, function (response) {
                    console.log('Good to see you, ' + response.name + '.');
                    $scope.fbloginreply = response;
                    console.log($scope.fbloginreply);
                    console.log($scope.fbloginreply.email);
                    $scope.fbid = $scope.fbloginreply.id;
                    $scope.fbemail = $scope.fbloginreply.email;
                    if ($scope.fbloginreply.email === undefined) {
                        $scope.fbemail = $scope.fbloginreply.id + "@facebook.com";
                    }
                    $http({
                        method: "POST",
                        data: JSON.stringify({"FB_ID": $scope.fbid, "lang": lang, "Email": $scope.fbemail}),
                        url: apiurl + "User/Login"
                    })
                        .then(function (response) {
                            if (response.data.isSuccess) {
                                console.log(response.data.Response);
                                console.log(response.data.Response.UserDetails.User_ID);
                                console.log(response.headers().token);
                                $scope.username = response.data.Response.PatientDetails.Patient_Name;
                                $scope.errorlogin = false;
                                $scope.islogedin = true;
                                $cookies.putObject('Patient_ID', response.data.Response.PatientDetails.Patient_ID);
                                $cookies.putObject('User_ID', response.data.Response.UserDetails.User_ID);
                                authFact.setAccessToken(response.headers().token);
                                location.reload();
                            } else {
                                $scope.errormsg = response.data.errorMessage;
                                console.log($scope.errormsg);
                                $scope.errorlogin = true;
                                $scope.islogedin = false;
                            }
                        }, function (reason) {
                            console.log(reason.data);
                        });
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    };
    //facebook get data at registration
    $scope.FBreg = function () {
        FB.login(function (response) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', {fields: 'id,name,email,birthday,picture,gender'}, function (response) {
                    console.log('Good to see you, ' + response.name + '.');
                    $scope.fbregeply = response;
                    console.log($scope.fbregeply);
                    console.log($scope.fbregeply.email);
                    $scope.fbid = $scope.fbregeply.id;
                    $scope.regname = $scope.fbregeply.name;
                    $scope.regemail = $scope.fbregeply.email;
                    $scope.choosefacebook = true;
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    };
    //forget password
    $scope.forgetpass = function () {
        $http({
            method: "POST",
            data: JSON.stringify({"Email": $scope.forgetemail, "lang": lang}),
            url: apiurl + "User/ForgetPassword"
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.isSuccess);
                    $('#resetform').tab('show');
                } else {
                    $scope.forgeterrormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //reset password
    $scope.resetpass = function () {
        $http({
            method: "POST",
            data: JSON.stringify({"Email": $scope.forgetemail, "Password": $scope.newpass, "VerifyCode": $scope.newvercode, "lang": lang}),
            url: apiurl + "User/ResetPassword"
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.isSuccess);
                    console.log(response.data.Response);
                    $scope.loginemail = $scope.forgetemail;
                    $scope.loginpass = $scope.newpass;
                    $scope.vermessage = "Your password has been reset successfully please return to login";
                } else {
                    $scope.forgeterrormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    $scope.subprofileview = function (x) {
        $cookies.putObject('subid', x);
        $location.path("/sub_profile");
    };
    //logout
    $scope.logout = function () {
        $cookies.remove('accessToken');
        $cookies.remove('Patient_ID');
        $cookies.remove('User_ID');
        $scope.islogedin = false;
        location.reload();
    };
}]);
//footerCtrl js
myApp.controller("footerCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //goto page
    $scope.gotopage = function (x) {$location.path("/" + x); };
    //contact us
    $scope.contactusform = function () {
        $http({
            method: "POST",
            url: apiurl + "Collection/ContactUs",
            data: JSON.stringify({"Email": $scope.contactemail, "Message": $scope.contactmsg, "Subject": $scope.contactsubject, "lang": lang})
        });
    };
    //join us
    $scope.editdetails = function () {
        $http({
            method: "POST",
            url: apiurl + "Collection/JoinUs",
            data: JSON.stringify({"Location": $scope.joinLocation, "Address": $scope.joinAddress, "DoctorName": $scope.joinDoctorName, "Speciality": $scope.joinSpeciality, "MobileNumber": $scope.joinMobileNumber, "Email": $scope.joinemail, "Message": $scope.joinmsg, "Type": $scope.joinType, "lang": lang})
        });
    };
}]);
//homeCtrl js
myApp.controller("homeCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //goto page
    $scope.gotopage = function (x) {$location.path("/" + x); };
    //home search
    $scope.homesearch = function (a) {
        $cookies.putObject('searchkeyword', a);
        $location.path("/doctors");
    };
}]);
//t&cCtrl js
myApp.controller("t&cCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    
}]);
//aboutCtrl js
myApp.controller("aboutCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    
}]);
//doctorsCtrl js
myApp.controller("doctorsCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //search
    $scope.filter = function () {
        console.log(JSON.stringify({"City": $scope.city, "Area": $scope.area, "Rate": $scope.rate, "Gender": $scope.gender, "Speciality": $scope.speciality, "MaxPrice": $scope.maxprice, "MinPrice": $scope.minprice, "Name": $scope.name, "Insurance": $scope.insurance, "Consultancy": $scope.consult, "PageNumber": "1", "NumberRecords": "100", "lang": lang}));
        $http({
            method: "POST",
            data: JSON.stringify({"City": $scope.city, "Area": $scope.area, "Rate": $scope.rate, "Gender": $scope.gender, "Speciality": $scope.speciality, "MaxPrice": $scope.maxprice, "MinPrice": $scope.minprice, "Name": $scope.name, "Insurance": $scope.insurance, "Consultancy": $scope.consult, "PageNumber": "1", "NumberRecords": "100", "lang": lang}),
            url: apiurl + "Doctor/FilterDoctor",
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.searchres = response.data.Response.List;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //if already loged in
    if ($cookies.get("searchkeyword") === undefined || $cookies.get("searchkeyword") === null || $cookies.get("searchkeyword") === "" || $cookies.get("searchkeyword") === " " || $cookies.get("searchkeyword") === "0") {
        $scope.filter();
    } else {
        $scope.name = JSON.parse($cookies.get("searchkeyword"));
        $cookies.putObject('searchkeyword', "");
        $scope.filter();
    }
    //get insurance
    $http({
        method: "GET",
        url: apiurl + "Collection/GetInsurance?PageNumber=1&NumberRecords=100&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.insurances = response.data.Response.Insurances;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get specialist
    $http({
        method: "GET",
        url: apiurl + "Collection/GetSpecialities?PageNumber=1&NumberRecords=100&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.specialists = response.data.Response.Specialities;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get cities
    $http({
        method: "GET",
        url: apiurl + "Collection/GetCities?PageNumber=1&NumberRecords=100&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.cities = response.data.Response.Areas;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get area
    $scope.getarea = function (a) {
        $http({
            method: "GET",
            url: apiurl + "Collection/GetAries?City_ID=" + a + "&PageNumber=1&NumberRecords=100&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.areas = response.data.Response.Areas;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get clinic doctors
    $scope.getclinicdoctors = function (x) {
        console.log(x);
        $scope.clinicdoctors = "";
        if ($scope.city === null || $scope.city === undefined) {$scope.city = ""; }
        if ($scope.area === null || $scope.area === undefined) {$scope.area = ""; }
        if ($scope.rate === null || $scope.rate === undefined) {$scope.rate = ""; }
        if ($scope.gender === null || $scope.gender === undefined) {$scope.gender = ""; }
        if ($scope.speciality === null || $scope.speciality === undefined) {$scope.speciality = ""; }
        if ($scope.maxprice === null || $scope.maxprice === undefined) {$scope.maxprice = ""; }
        if ($scope.minprice === null || $scope.minprice === undefined) {$scope.minprice = ""; }
        if ($scope.name === null || $scope.name === undefined) {$scope.name = ""; }
        if ($scope.insurance === null || $scope.insurance === undefined) {$scope.insurance = ""; }
        if ($scope.consult === null || $scope.consult === undefined) {$scope.consult = ""; }
        $http({
            method: "GET",
            url: apiurl + "Doctor/GetClinicDoctors?Clinic_ID=" + x + "&City=" + $scope.city + "&Area=" + $scope.area + "&Rate=" + $scope.rate + "&Gender=" + $scope.gender + "&Speciality=" + $scope.speciality + "&MaxPrice=" + $scope.maxprice + "&MinPrice=" +  $scope.minprice + "&Name=" + $scope.name + "&Insurance=" + $scope.insurance + "&Consultancy=" + $scope.consult + "&PageNumber=1&NumberRecords=100&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.clinicdoctors = response.data.Response.List;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get doctor clinics
    $scope.getdoctorclinics = function (x) {
        console.log(x);
        $scope.doctorclinics = "";
        if ($scope.city === null || $scope.city === undefined) {$scope.city = ""; }
        if ($scope.area === null || $scope.area === undefined) {$scope.area = ""; }
        if ($scope.rate === null || $scope.rate === undefined) {$scope.rate = ""; }
        if ($scope.gender === null || $scope.gender === undefined) {$scope.gender = ""; }
        if ($scope.speciality === null || $scope.speciality === undefined) {$scope.speciality = ""; }
        if ($scope.maxprice === null || $scope.maxprice === undefined) {$scope.maxprice = ""; }
        if ($scope.minprice === null || $scope.minprice === undefined) {$scope.minprice = ""; }
        if ($scope.name === null || $scope.name === undefined) {$scope.name = ""; }
        if ($scope.insurance === null || $scope.insurance === undefined) {$scope.insurance = ""; }
        if ($scope.consult === null || $scope.consult === undefined) {$scope.consult = ""; }
        $http({
            method: "GET",
            url: apiurl + "Doctor/GetDoctorClinics?Doctor_ID=" + x + "&City=" + $scope.city + "&Area=" + $scope.area + "&Rate=" + $scope.rate + "&Gender=" + $scope.gender + "&Speciality=" + $scope.speciality + "&MaxPrice=" + $scope.maxprice + "&MinPrice=" +  $scope.minprice + "&Name=" + $scope.name + "&Insurance=" + $scope.insurance + "&Consultancy=" + $scope.consult + "&PageNumber=1&NumberRecords=100&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.doctorclinics = response.data.Response.Clinics;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //booking ready
    $scope.prebooking = function (x, y, z, w) {
        $scope.selecteddoctorid = z;
        $scope.selecteddoctorname = w;
        $scope.selectedclinicid = x;
        $scope.selectedclinicname = y;
        console.log($scope.selecteddoctorid);
        console.log($scope.selecteddoctorname);
        console.log($scope.selectedclinicid);
        console.log($scope.selectedclinicname);
        $scope.bookingconfirm = false;
        $http({
            method: "GET",
            url: apiurl + "Doctor/DoctorTimes?Doctor_ID=" + $scope.selecteddoctorid + "&Clinic_ID=" + $scope.selectedclinicid + "&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response.Days);
                    $scope.bookingdays = response.data.Response.Days;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //book doctor and clinic
    $scope.booking = function () {
        console.log($scope.selecteddoctorid);
        console.log($scope.selecteddoctorname);
        console.log($scope.selectedclinicid);
        console.log($scope.selectedclinicname);
        $http({
            method: "POST",
            data: JSON.stringify({"Patient_ID": JSON.parse($cookies.get("Patient_ID")), "Doctor_ID": $scope.selecteddoctorid, "Visit_Date": $scope.vdate, "Visit_Info": $scope.vinfo, "Clinic_ID": $scope.selectedclinicid, "lang": lang}),
            url: apiurl + "Order/DoctorVisit",
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.bookingconfirm = true;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
}]);
//home_visitCtrl js
myApp.controller("home_visitCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //calender ready
    var d = 1,
        m = 1,
        y = 2018,
        h = 0,
        min = 0;
    $scope.dyasinmonth = [];
    $scope.monthsinyear = [];
    $scope.yearsrange = [];
    $scope.hourinday = [];
    $scope.mininhour = [];
    for (d; d <= 31; d = d + 1) {
        $scope.dyasinmonth.push(d);
    }
    for (m; m <= 12; m = m + 1) {
        $scope.monthsinyear.push(m);
    }
    for (y; y >= 2017; y = y - 1) {
        $scope.yearsrange.push(y);
    }
    for (h; h <= 23; h = h + 1) {
        $scope.hourinday.push(h);
    }
    for (min; min <= 59; min = min + 1) {
        $scope.mininhour.push(min);
    }
    //get nurse price
    $http({
        method: "GET",
        url: apiurl + "Collection/GetNursePrice?lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.nurseprice = response.data.Response.Price.Price;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get cities
    $http({
        method: "GET",
        url: apiurl + "Collection/GetCities?PageNumber=1&NumberRecords=100&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.cities = response.data.Response.Areas;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get area
    $scope.getarea = function (a) {
        $http({
            method: "GET",
            url: apiurl + "Collection/GetAries?City_ID=" + a + "&PageNumber=1&NumberRecords=100&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.areas = response.data.Response.Areas;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get spetiality
    $scope.getspetial = function (a) {
        $http({
            method: "GET",
            url: apiurl + "Collection/GetHVSpecialities?PageNumber=1&NumberRecords=100&Area_ID=" + a + "&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.speciality = response.data.Response.Specialities;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get spetiality
    $scope.getdocprice = function (a) {
        console.log(a);
    };
    //edit patient details
    $scope.housevisit = function (a, b, d, e, f, g, h, i, j, k, m, n) {
        //(hvnmae, hvnumber, hvday, hvmonth, hvyear, hvhour, hvmin, hvinfo, 'type', hvadd, hvspecial, hvtest)
        console.log(JSON.stringify({"PatientName": a, "PatientNumber": b, "Patient_ID": JSON.parse($cookies.get("Patient_ID")), "Visit_Date": f + "-" + e + "-" + d + " " + g + ":" + h, "Visit_Info": i, "Type": j, "Address": k, "Location": k, "Speciality": m, "Tests": [n], "lang": lang}));
        $http({
            method: "POST",
            url: apiurl + "Order/CreateHVist",
            data: JSON.stringify({"PatientName": a, "PatientNumber": b, "Patient_ID": JSON.parse($cookies.get("Patient_ID")), "Visit_Date": f + "-" + e + "-" + d + " " + g + ":" + h, "Visit_Info": i, "Type": j, "Address": k, "Location": k, "Speciality": m, "Tests": [n], "lang": lang}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log("true");
                    $location.path("/profile");
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
}]);
//editCtrl js
myApp.controller("editCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //if already loged in
    $scope.userid = authFact.getAccessToken();
    if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
        $cookies.remove('accessToken');
        $scope.islogedin = false;
    } else {
        $scope.islogedin = true;
    }
    //calender ready
    var d = 1,
        m = 1,
        y = 2017;
    $scope.dyasinmonth = [];
    $scope.monthsinyear = [];
    $scope.yearsrange = [];
    for (d; d <= 31; d = d + 1) {
        $scope.dyasinmonth.push(d);
    }
    for (m; m <= 12; m = m + 1) {
        $scope.monthsinyear.push(m);
    }
    for (y; y >= 1907; y = y - 1) {
        $scope.yearsrange.push(y);
    }
    //get user details
    $http({
        method: "GET",
        url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientdetails = response.data.Response.PatientDetails;
                $scope.dob1 = response.data.Response.PatientDetails.DOB.substring(8, 10);
                $scope.dob2 = response.data.Response.PatientDetails.DOB.substring(5, 7);
                $scope.dob3 = response.data.Response.PatientDetails.DOB.substring(0, 4);
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //edit patient details
    $scope.editdetails = function () {
        $http({
            method: "POST",
            url: apiurl + "Patient/EditPatient",
            data: JSON.stringify({"Address": $scope.patientdetails.Address, "Address_AR": $scope.patientdetails.Address, "DOB": $scope.dob3 + "-" + $scope.dob2 + "-" + $scope.dob1 + "T00:00:00", "Gender": $scope.patientdetails.Gender, "Mobile_number": $scope.patientdetails.Mobile_number, "Name": $scope.patientdetails.Name, "Name_AR": $scope.patientdetails.Name, "Patient_ID": JSON.parse($cookies.get("Patient_ID")), "Email": $scope.patientdetails.Email, "lang": lang}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log("true");
                    $location.path("/profile");
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //edit patient picture
    $scope.editpicture = function () {
        var formData = new FormData();
        formData.append("myFile", document.getElementById("editimage").files[0]);
        console.log(formData);
        var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://yakensolution.cloudapp.net:80/LiveHealthy/api/Patient/UpdatePatientPicture?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")),
                "method": "POST",
                "headers": {
                    "userid": JSON.parse($cookies.get("User_ID")),
                    "token": JSON.parse($cookies.get("accessToken"))
                },
                "processData": false,
                "contentType": false,
                "mimeType": "multipart/form-data",
                "data": formData
            };
        $.ajax(settings).done(function (response) {
            console.log(response);
            location.reload();
        });
    };
    //goto page
    $scope.gotopage = function (x) {$location.path("/" + x); };
}]);
//profileCtrl js
myApp.controller("profileCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //if already loged in
    $scope.userid = authFact.getAccessToken();
    if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
        $cookies.remove('accessToken');
        $scope.islogedin = false;
    } else {
        $scope.islogedin = true;
    }
    //get user details
    $http({
        method: "GET",
        url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientdetails = response.data.Response;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get notifications
    $scope.getnotifications = function () {
        $http({
            method: "GET",
            url: apiurl + "Patient/PatientNotifications?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&PageNumber=" + "1" + "&NumberRecords=" + "100" + "&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.patientnotifications = response.data.Response.Notifications;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get patient profile
    $http({
        method: "GET",
        url: apiurl + "Patient/GetProfile?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientprofile = response.data.Response;
                $scope.notelist = [];
                //var i = 0;
                //for (i; i < response.data.Response.medicalNotes.length; i = i + 1) {
                //    $scope.notelist.push(response.data.Response.medicalNotes[i].Note_ID);
                //    console.log(response.data.Response.medicalNotes[i].Note_ID);
                //}
                $scope.patientheight = response.data.Response.Height;
                $scope.patientweight = response.data.Response.Weight;
                $scope.seperator = response.data.Response.Pressure.indexOf("/");
                $scope.patientpressure1 = response.data.Response.Pressure.substring(0, $scope.seperator);
                $scope.patientpressure2 = response.data.Response.Pressure.substring($scope.seperator + 1);
                $scope.patientnotes = response.data.Response.medicalNotes;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get notes
    $http({
        method: "GET",
        url: apiurl + "Patient/GetNotes?lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.allnotes = response.data.Response.Notes;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //set note list
    $scope.setnotelist = function (x, y) {
        if (x) {
            $scope.notelist.push(y);
            //if($scope.diabetes[i].IsSelected) list.push($scope.diabetes[i]);
        } else {
            $scope.notelist.splice($scope.notelist.indexOf(y), 1);
        }
        console.log($scope.notelist);
    };
    //edit medical profile
    $scope.editmprofile = function () {
        console.log($scope.patientheight);
        console.log($scope.patientweight);
        console.log($scope.patientpressure1);
        console.log($scope.patientpressure2);
        console.log($scope.notelist);
        $http({
            method: "POST",
            url: apiurl + "Patient/EditProfile",
            data: JSON.stringify({"Patient_ID": JSON.parse($cookies.get("Patient_ID")), "Height": $scope.patientheight, "Weight": $scope.patientweight, "Pressure": $scope.patientpressure1 + "/" + $scope.patientpressure2, "Note_IDs": $scope.notelist, "lang": lang}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log("true");
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get appointments
    $http({
        method: "GET",
        url: apiurl + "Patient/Appointments?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&PageNumber=1&NumberRecords=100&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientappoint = response.data.Response.Appointments;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get Medicines
    $http({
        method: "GET",
        url: apiurl + "Patient/GetMedicine?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientmedicine = response.data.Response.Medicines;
                $scope.newmedication = [];
                var i = 0;
                for (i; i < response.data.Response.Medicines.length; i = i + 1) {
                    $scope.newmedication.push(response.data.Response.Medicines[i]);
                    console.log(response.data.Response.Medicines[i]);
                }
                console.log($scope.newmedication);
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //cancel appointment
    $scope.cancelappoint = function (x, y) {
        $http({
            method: "POST",
            url: apiurl + "Patient/CancelAppointment",
            data: JSON.stringify({"Patient_ID": JSON.parse($cookies.get("Patient_ID")), "Type": y, "Visit_ID": x}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data);
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //rate appointment
    $scope.rateappoint = function (x, y, z) {
        $http({
            method: "POST",
            url: apiurl + "Patient/RateAppointment",
            data: JSON.stringify({"Patient_ID": JSON.parse($cookies.get("Patient_ID")), "Type": x, "Visit_ID": y, "Rate": z}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data);
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //find medication
    $scope.findmed = function (x) {
        $http({
            method: "GET",
            url: apiurl + "Collection/GetMedications?SearchString=" + x + "&PageNumber=1&NumberRecords=100&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.foundmeds = response.data.Response.Areas;
                    console.log(x);
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //find medication
    $scope.selectmed = function (x, y) {
        $scope.selectedmedname = x;
        $scope.selectedmedid = y;
    };
    //update medication
    $scope.updatemed = function (x, y, z, w) {
        console.log(x);//add or remove(true or false)
        console.log(y);//med id
        console.log(z);//name
        console.log(w);//dosage
        if (x) {
            $scope.newmedication.push({"Medicine_ID": y,
                "Name": z,
                "Dosage": w});
        } else {
            var i = 0;
            for (i; i < $scope.newmedication.length; i = i + 1) {
                console.log($scope.newmedication[i].Medicine_ID);
                if ($scope.newmedication[i].Medicine_ID === y) {
                    console.log(i);
                    $scope.newmedication.splice(i, 1);
                }
            }
        }
        console.log($scope.newmedication);
        $http({
            method: "POST",
            url: apiurl + "Patient/UpdateProfileMedications",
            data: JSON.stringify({"AllMedications": $scope.newmedication, "Patient_ID": JSON.parse($cookies.get("Patient_ID")), "lang": lang}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //goto page
    $scope.gotopage = function (x) {$('#regmodal').modal("hide"); $location.path("/" + x); };
}]);
//subprofileCtrl js
myApp.controller("subprofileCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //if already loged in
    $scope.userid = authFact.getAccessToken();
    if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
        $cookies.remove('accessToken');
        $scope.islogedin = false;
    } else {
        $scope.islogedin = true;
    }
    //get user details
    $http({
        method: "GET",
        url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientdetails = response.data.Response;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get notifications
    $scope.getnotifications = function () {
        $http({
            method: "GET",
            url: apiurl + "Patient/PatientNotifications?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&PageNumber=" + "1" + "&NumberRecords=" + "100" + "&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.patientnotifications = response.data.Response.Notifications;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get patient profile
    $http({
        method: "GET",
        url: apiurl + "Patient/GetProfile?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientprofile = response.data.Response;
                $scope.notelist = [];
                //var i = 0;
                //for (i; i < response.data.Response.medicalNotes.length; i = i + 1) {
                //    $scope.notelist.push(response.data.Response.medicalNotes[i].Note_ID);
                //    console.log(response.data.Response.medicalNotes[i].Note_ID);
                //}
                $scope.patientheight = response.data.Response.Height;
                $scope.patientweight = response.data.Response.Weight;
                $scope.seperator = response.data.Response.Pressure.indexOf("/");
                $scope.patientpressure1 = response.data.Response.Pressure.substring(0, $scope.seperator);
                $scope.patientpressure2 = response.data.Response.Pressure.substring($scope.seperator + 1);
                $scope.patientnotes = response.data.Response.medicalNotes;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get notes
    $http({
        method: "GET",
        url: apiurl + "Patient/GetNotes?lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.allnotes = response.data.Response.Notes;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //set note list
    $scope.setnotelist = function (x, y) {
        if (x) {
            $scope.notelist.push(y);
            //if($scope.diabetes[i].IsSelected) list.push($scope.diabetes[i]);
        } else {
            $scope.notelist.splice($scope.notelist.indexOf(y), 1);
        }
        console.log($scope.notelist);
    };
    //edit medical profile
    $scope.editmprofile = function () {
        console.log($scope.patientheight);
        console.log($scope.patientweight);
        console.log($scope.patientpressure1);
        console.log($scope.patientpressure2);
        console.log($scope.notelist);
        $http({
            method: "POST",
            url: apiurl + "Patient/EditProfile",
            data: JSON.stringify({"Patient_ID": JSON.parse($cookies.get("subid")), "Height": $scope.patientheight, "Weight": $scope.patientweight, "Pressure": $scope.patientpressure1 + "/" + $scope.patientpressure2, "Note_IDs": $scope.notelist, "lang": lang}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log("true");
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //get appointments
    $http({
        method: "GET",
        url: apiurl + "Patient/Appointments?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&PageNumber=1&NumberRecords=100&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientappoint = response.data.Response.Appointments;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get Medicines
    $http({
        method: "GET",
        url: apiurl + "Patient/GetMedicine?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&lang=" + lang,
        headers: {
            "UserID": JSON.parse($cookies.get("User_ID")),
            "Token": JSON.parse($cookies.get("accessToken"))
        }
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.patientmedicine = response.data.Response.Medicines;
                $scope.newmedication = [];
                var i = 0;
                for (i; i < response.data.Response.Medicines.length; i = i + 1) {
                    $scope.newmedication.push(response.data.Response.Medicines[i]);
                    console.log(response.data.Response.Medicines[i]);
                }
                console.log($scope.newmedication);
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //cancel appointment
    $scope.cancelappoint = function (x, y) {
        $http({
            method: "POST",
            url: apiurl + "Patient/CancelAppointment",
            data: JSON.stringify({"Patient_ID": JSON.parse($cookies.get("subid")), "Type": y, "Visit_ID": x}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data);
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //rate appointment
    $scope.rateappoint = function (x, y, z) {
        $http({
            method: "POST",
            url: apiurl + "Patient/RateAppointment",
            data: JSON.stringify({"Patient_ID": JSON.parse($cookies.get("subid")), "Type": x, "Visit_ID": y, "Rate": z}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data);
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //find medication
    $scope.findmed = function (x) {
        $http({
            method: "GET",
            url: apiurl + "Collection/GetMedications?SearchString=" + x + "&PageNumber=1&NumberRecords=100&lang=" + lang,
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.foundmeds = response.data.Response.Areas;
                    console.log(x);
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //find medication
    $scope.selectmed = function (x, y) {
        $scope.selectedmedname = x;
        $scope.selectedmedid = y;
    };
    //update medication
    $scope.updatemed = function (x, y, z, w) {
        console.log(x);//add or remove(true or false)
        console.log(y);//med id
        console.log(z);//name
        console.log(w);//dosage
        if (x) {
            $scope.newmedication.push({"Medicine_ID": y,
                "Name": z,
                "Dosage": w});
        } else {
            var i = 0;
            for (i; i < $scope.newmedication.length; i = i + 1) {
                console.log($scope.newmedication[i].Medicine_ID);
                if ($scope.newmedication[i].Medicine_ID === y) {
                    console.log(i);
                    $scope.newmedication.splice(i, 1);
                }
            }
        }
        console.log($scope.newmedication);
        $http({
            method: "POST",
            url: apiurl + "Patient/UpdateProfileMedications",
            data: JSON.stringify({"AllMedications": $scope.newmedication, "Patient_ID": JSON.parse($cookies.get("subid")), "lang": lang}),
            headers: {
                "UserID": JSON.parse($cookies.get("User_ID")),
                "Token": JSON.parse($cookies.get("accessToken"))
            }
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    location.reload();
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //goto page
    $scope.gotopage = function (x) {$('#regmodal').modal("hide"); $location.path("/" + x); };
}]);
//redirectCtrl js
myApp.controller("redirectCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    var locationurl = window.location.href;
    if (locationurl.indexOf("DoctorUpdate") >= 0) {
        $scope.docupdate = true;// required url not found
    } else {
        $scope.isnotfound = true;// required url not found
    }
}]);
//404Ctrl js
myApp.controller("404Ctrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //home page
    $scope.homepage = function () {$location.path("/"); };
}]);
//updatedoctorCrtl js
myApp.controller("updatedoctorCrtl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    $scope.doctoken = window.location.href.slice((window.location.href.indexOf("DoctorUpdate/") + 13));
    console.log($scope.doctoken);
    $scope.docarabic = false;
    //time ready
    var h = 0,
        min = 0;
    $scope.hourinday = [];
    $scope.mininhour = [];
    for (h; h <= 23; h = h + 1) {
        $scope.hourinday.push(h);
    }
    for (min; min <= 59; min = min + 1) {
        $scope.mininhour.push(min);
    }
    //get doc id
    $http({
        method: "GET",
        url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/GetDoctorLoginData?DoctorToken=" + $scope.doctoken
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.docid = response.data.Response.UserDetails.DoctorID;
                $scope.docuserid = response.data.Response.UserDetails.User_ID;
                //console.log($scope.docid);
                //console.log($scope.docuserid);
            } else {
                $location.path("/notfound");
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            $location.path("/notfound");
            console.log(reason.data);
        });
    //get specialist
    $http({
        method: "GET",
        url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Specialities/GetSpecialities?PageNumber=1&NumberRecords=100"
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.specialists = response.data.Response;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get days
    $http({
        method: "GET",
        url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Days/GetDays?PageNumber=1&NumberRecords=10"
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.weekdays = response.data.Response;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get cities
    $http({
        method: "GET",
        url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Cities/GetCities?PageNumber=1&NumberRecords=100"
    })
        .then(function (response) {
            if (response.data.isSuccess) {
                console.log(response.data.Response);
                $scope.cities = response.data.Response;
            } else {
                $scope.errormsg = response.data.errorMessage;
                console.log($scope.errormsg);
            }
        }, function (reason) {
            console.log(reason.data);
        });
    //get area
    $scope.getarea = function (a) {
        $http({
            method: "GET",
            url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Areas/GetAreas?City_ID=" + a + "&PageNumber=1&NumberRecords=100"
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.areas = response.data.Response;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //edit doctor details
    $scope.docdetails = function (a, b, c, d, e, f, g) {//docnumber arname enname specialityid docemail endescription ardescription
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoUpdateDoctorDetails",
            data: JSON.stringify({"Doctor_ID": $scope.docid, "Mobile_Number": a, "Name_AR": b, "Name": c, "Speciality_ID": d, "Email": e, "Descrpition": f, "Descrpition_AR": g, "lang": lang})
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    $scope.docdatachanged = true;
                    console.log(response.data);
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //create clinic list
    $scope.listofclinics = [];
    //add or remove clinic
    $scope.addremoveclinic = function (x, y, a, b, c, d, e, f, g, h, i, j, k) {//ClinicName, ClinicNameAR, ClinicPrice, ClinicAddress, ClinicAddressAR, ClinicCityID, ClinicAreaID, MobileNumber, ClinicLandLine, ClinicRequestsPerDay, ClinicDiscount
        //console.log(x);//add or remove(true or false)
        if (x) {
            $scope.listofclinics.push({"Clinic_ID": 0,
                "Clinic_Name": a,
                "Clinic_Name_AR": b,
                "Price": c,
                "Address": d,
                "Address_AR": e,
                "City_ID": f,
                "Area_ID": g,
                "Mobile_Number": " ",
                "Land_Line": i,
                "Requests_Per_Day": j,
                "Discount": k});
        } else {
            var i = 0;
            for (i; i < $scope.listofclinics.length; i = i + 1) {
                console.log($scope.listofclinics[i].Clinic_ID);
                if ($scope.listofclinics[i].Clinic_ID === y) {
                    //console.log(i);
                    $scope.listofclinics.splice(i, 1);
                }
            }
        }
        console.log($scope.listofclinics);
        $scope.ClinicName = "";
        $scope.ClinicNameAR = "";
        $scope.ClinicPrice = "";
        $scope.ClinicAddress = "";
        $scope.ClinicAddressAR = "";
        $scope.ClinicCityID = "";
        $scope.ClinicAreaID = "";
        $scope.MobileNumber = "";
        $scope.ClinicLandLine = "";
        $scope.ClinicRequestsPerDay = "";
        $scope.ClinicDiscount = "";
    };
    //update clinics
    $scope.sendclinics = function () {
        console.log($scope.listofclinics);
        console.log(JSON.stringify({"AllClinics": JSON.parse(angular.toJson($scope.listofclinics)), "Doctor_ID": $scope.docid, "lang": lang}));
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoUpdateDoctorClinics",
            data: JSON.stringify({"AllClinics": JSON.parse(angular.toJson($scope.listofclinics)), "Doctor_ID": $scope.docid, "lang": lang})
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $http({
                        method: "GET",
                        url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoGetDoctorClinics?Doctor_ID=" + $scope.docid + "&PageNumber=1&NumberRecords=100&lang=" + lang
                    })
                        .then(function (response) {
                            if (response.data.isSuccess) {
                                console.log(response.data.Response);
                                $scope.savedclinics = response.data.Response.Clinics;
                            } else {
                                $scope.errormsg = response.data.errorMessage;
                                console.log($scope.errormsg);
                            }
                        }, function (reason) {
                            console.log(reason.data);
                        });
                    $scope.clinicsaved = true;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    $scope.daysofclinic = [];
    //add or remove clinic
    $scope.addschedul = function (a, b, c) {
        $scope.daysofclinic.push({"DayID": a,
                "From_Hour": JSON.stringify(b).substr(15, 8),
                "To_Hour": JSON.stringify(c).substr(15, 8)});
        //console.log($scope.daysofclinic);
        $scope.wday = "";
        $scope.fromtime = "";
        $scope.totime = "";
    };
    //update clinic times
    $scope.saveclinicschedule = function (a) {
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoUpdateDoctorTimes",
            data: JSON.stringify({"AllSlots": $scope.daysofclinic, "DoctorID": $scope.docid, "Clinic_ID": a})
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.daysofclinic.splice(0, $scope.daysofclinic.length);
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //Finish
    $scope.finish = function () {
        $http({
            method: "GET",
            url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/SendConfirmationMail?DoctorID=" + $scope.docid
        })
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.log(response.data.Response);
                    $scope.mailsent = true;
                } else {
                    $scope.errormsg = response.data.errorMessage;
                    console.log($scope.errormsg);
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
}]);