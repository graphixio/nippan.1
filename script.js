document.addEventListener('DOMContentLoaded', () => {
    const principalAmountInput = document.getElementById('principalAmount');
    const gstRateSelect = document.getElementById('gstRate');
    const customRateGroup = document.getElementById('customRateGroup');
    const customRateInput = document.getElementById('customRate');
    const operationButtons = document.querySelectorAll('.operation-buttons .btn');
    const calculateBtn = document.getElementById('calculateBtn');
    const clearBtn = document.getElementById('clearBtn');

    const finalAmountSpan = document.getElementById('finalAmount');
    const gstAmountSpan = document.getElementById('gstAmount');
    const cgstAmountSpan = document.getElementById('cgstAmount');
    const sgstAmountSpan = document.getElementById('sgstAmount');
    const resultsDisplay = document.querySelector('.results-display');

    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    let currentOperation = 'add'; // Default operation

    // --- Utility Functions ---

    function formatCurrency(value) {
        if (isNaN(value)) {
            return '₹ 0.00';
        }
        return `₹ ${value.toFixed(2)}`;
    }

    function showToast(message, duration = 3000) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hidden');
        }, duration);
    }

    function hideResults() {
        resultsDisplay.classList.add('hidden');
        // Clear result spans immediately when hiding
        finalAmountSpan.textContent = formatCurrency(0);
        gstAmountSpan.textContent = formatCurrency(0);
        cgstAmountSpan.textContent = formatCurrency(0);
        sgstAmountSpan.textContent = formatCurrency(0);
    }

    function showResults() {
        resultsDisplay.classList.remove('hidden');
    }

    // --- Calculation Logic ---

    function calculateGST() {
        const principalAmount = parseFloat(principalAmountInput.value);
        let gstRate = parseFloat(gstRateSelect.value);

        if (gstRateSelect.value === 'custom') {
            gstRate = parseFloat(customRateInput.value);
        }

        // Input validation
        if (isNaN(principalAmount) || principalAmount <= 0) {
            showToast("Please enter a valid amount (greater than 0).", 4000);
            hideResults();
            return;
        }

        if (isNaN(gstRate) || gstRate < 0 || (gstRateSelect.value === 'custom' && gstRate > 100)) {
            showToast("Please select a valid GST rate or enter a custom rate between 0-100%.", 4000);
            hideResults();
            return;
        }

        let calculatedGSTAmount, finalValue, originalBaseAmount;

        if (currentOperation === 'add') {
            // Add GST: Final Value = Amount + (Amount * Rate / 100)
            calculatedGSTAmount = (principalAmount * gstRate) / 100;
            finalValue = principalAmount + calculatedGSTAmount;
            originalBaseAmount = principalAmount; // Principal is the base amount
        } else { // 'remove' GST
            // Remove GST: Base Amount = Amount / (1 + Rate / 100)
            originalBaseAmount = principalAmount / (1 + gstRate / 100);
            calculatedGSTAmount = principalAmount - originalBaseAmount;
            finalValue = principalAmount; // Principal is the final value
        }

        const cgst = calculatedGSTAmount / 2;
        const sgst = calculatedGSTAmount / 2;

        // Display results
        finalAmountSpan.textContent = formatCurrency(finalValue);
        gstAmountSpan.textContent = formatCurrency(calculatedGSTAmount);
        cgstAmountSpan.textContent = formatCurrency(cgst);
        sgstAmountSpan.textContent = formatCurrency(sgst);

        showResults(); // Make sure results are visible
    }

    // --- Event Handlers ---

    function handleGSTRateChange() {
        if (gstRateSelect.value === 'custom') {
            customRateGroup.classList.remove('hidden');
            customRateInput.focus();
        } else {
            customRateGroup.classList.add('hidden');
        }
        // Trigger calculation when rate changes, but only if amount is already entered
        if (principalAmountInput.value) {
            calculateGST();
        } else {
            hideResults(); // Hide results if rate changes and no amount is entered
        }
    }

    function handleOperationChange(event) {
        operationButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        currentOperation = event.target.dataset.operation;
        // Trigger calculation when operation changes
        if (principalAmountInput.value) {
            calculateGST();
        }
    }

    function clearCalculator() {
        principalAmountInput.value = '';
        gstRateSelect.value = ''; // Reset select to default option
        customRateInput.value = '';
        customRateGroup.classList.add('hidden'); // Hide custom rate input

        // Reset operation button to 'Add GST'
        operationButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.operation-buttons .btn[data-operation="add"]').classList.add('active');
        currentOperation = 'add';

        hideResults(); // Hide and clear results display
        showToast("Calculator cleared!", 2000);
    }

    // --- Event Listeners ---

    principalAmountInput.addEventListener('input', calculateGST); // Live calculation
    gstRateSelect.addEventListener('change', handleGSTRateChange);
    customRateInput.addEventListener('input', calculateGST); // Live calculation for custom rate

    operationButtons.forEach(button => {
        button.addEventListener('click', handleOperationChange);
    });

    calculateBtn.addEventListener('click', calculateGST);
    clearBtn.addEventListener('click', clearCalculator);

    // Initial state setup
    hideResults(); // Ensure results are hidden on load
});