const isEmail = (email) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regex)) {
        return true;
    } else {
        return false;
    }
}

const isEmpty = (string) => {
    if (string.trim() === '') {
        return true;
    } else {
        return false;
    };
};

exports.validateSignUpData = data => {//  User validtion 
    if (isEmpty(data.email)) {
        errors.email = 'Email must not be empty';
    } else if (!isEmail(data.email)) {
        errors.email = 'Email is not valid format';
    }

    if (isEmpty(data.password)) {
        errors.password = 'Password must not be empty';
    }
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Password must Match';
    }

    if (isEmpty(data.handle)) {
        errors.handle = 'handle must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = data => {
    if (!valid) {
        return response.status(400).json(errors)
    }

    if (isEmpty(user.email)) {
        errors.email = 'Must not be empty';
    }
    if (isEmpty(user.password)) {
        errors.password = 'Must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}