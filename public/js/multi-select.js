$(document).ready(function () {
    $('#users').multiselect({
        nonSelectedText: 'Select Users',
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        includeSelectAllOption: true,
        buttonWidth: '100%',
        maxHeight: 200,
    });

    $('#select_users').multiselect({
        nonSelectedText: 'Select Users',
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        includeSelectAllOption: true,
        buttonWidth: '85%',
        maxHeight: 200,
    });
});