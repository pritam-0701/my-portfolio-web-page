function openTab(tabName) {
    // Hidden all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Deactivate all tab buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(button => button.classList.remove('active'));

    // Show selected tab content and activate button
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}