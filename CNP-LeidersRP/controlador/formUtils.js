/**
 * Crea y muestra un modal de formulario profesional
 * @param {string} title - Título del formulario
 * @param {array} fields - Array de campos
 * @param {function} onSubmit - Callback al enviar
 */
export function showFormModal(title, fields, onSubmit) {
    let existingModal = document.getElementById('formModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'formModal';
    modal.classList.add('form-modal-overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('form-modal-content');

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.classList.add('form-modal-title');
    modalContent.appendChild(titleElement);

    const form = document.createElement('form');
    form.classList.add('form-modal-form');

    fields.forEach((field, index) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.classList.add('form-group');

        const label = document.createElement('label');
        label.textContent = field.label;
        label.classList.add('form-label');
        if (field.required) label.innerHTML += '<span class="required">*</span>';
        fieldGroup.appendChild(label);

        let input;
        
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
            input.value = field.value || '';
            input.name = field.name;
            input.placeholder = field.placeholder || '';
            input.required = field.required || false;
            input.classList.add('form-input');
        } else if (field.type === 'select') {
            input = document.createElement('select');
            if (field.options && Array.isArray(field.options)) {
                field.options.forEach(option => {
                    const optElement = document.createElement('option');
                    optElement.value = option.value;
                    optElement.textContent = option.label;
                    input.appendChild(optElement);
                });
            }
            if (field.value) {
                input.value = field.value;
            }
            input.name = field.name;
            input.required = field.required || false;
            input.classList.add('form-input');
        } else if (field.type === 'fine-calculator') {
            input = document.createElement('div');
            input.classList.add('fine-calculator-wrapper');
            input.id = `fineCalculator-${index}`;
            
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Ej: 001, robo, fraude...';
            searchInput.classList.add('form-input', 'fine-search-calc');
            searchInput.id = `fineSearchCalc-${index}`;
            
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.classList.add('fine-suggestions-calc');
            suggestionsDiv.id = `fineSuggestionsCalc-${index}`;
            
            const selectedDiv = document.createElement('div');
            selectedDiv.classList.add('selected-fines-calc');
            selectedDiv.id = `selectedFinesCalc-${index}`;
            
            const totalDiv = document.createElement('div');
            totalDiv.classList.add('total-calculator');
            totalDiv.id = `totalCalc-${index}`;
            totalDiv.innerHTML = '<strong>💰 Total: 0€</strong>';
            
            const useBtn = document.createElement('button');
            useBtn.type = 'button';
            useBtn.textContent = 'Usar este total ↓';
            useBtn.classList.add('use-total-btn');
            useBtn.id = `useBtn-${index}`;
            
            input.appendChild(searchInput);
            input.appendChild(suggestionsDiv);
            input.appendChild(selectedDiv);
            input.appendChild(totalDiv);
            input.appendChild(useBtn);
            
            input.dataset.multas = JSON.stringify(field.multas || []);
            input.dataset.selectedFines = JSON.stringify([]);
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
            input.value = field.value || '';
            input.name = field.name;
            input.placeholder = field.placeholder || '';
            input.required = field.required || false;
            input.classList.add('form-input');
        }
        
        fieldGroup.appendChild(input);
        form.appendChild(fieldGroup);
    });

    // Botones
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('form-buttons');

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Guardar';
    submitBtn.classList.add('form-btn-submit');

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.classList.add('form-btn-cancel');
    cancelBtn.onclick = () => modal.remove();

    buttonsContainer.appendChild(submitBtn);
    buttonsContainer.appendChild(cancelBtn);
    form.appendChild(buttonsContainer);

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {};
        
        const inputs = form.querySelectorAll('input[name], textarea[name], select[name]');
        inputs.forEach(inp => {
            data[inp.name] = inp.value;
        });
        
        // Procesar campos fine-calculator
        const calculators = form.querySelectorAll('.fine-calculator-wrapper');
        if (calculators.length > 0) {
            calculators.forEach(calc => {
                const selectedFines = JSON.parse(calc.dataset.selectedFines || '[]');
                let totalCalc = 0;
                selectedFines.forEach(f => {
                    totalCalc += f.precio;
                });
                data.calculatedPrice = totalCalc;
            });
        }
        
        for (let field of fields) {
            if (field.required && field.type !== 'fine-calculator') {
                const fieldValue = data[field.name];
                if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) {
                    alert(`El campo "${field.label}" es obligatorio.`);
                    return;
                }
            }
        }

        await onSubmit(data);
        modal.remove();
    };

    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Configurar event listeners para fine-calculator
    const calculators = form.querySelectorAll('.fine-calculator-wrapper');
    calculators.forEach((calc, idx) => {
        const searchInput = calc.querySelector('.fine-search-calc');
        const suggestionsDiv = calc.querySelector('.fine-suggestions-calc');
        const selectedDiv = calc.querySelector('.selected-fines-calc');
        const totalDiv = calc.querySelector('.total-calculator');
        const useBtn = calc.querySelector('.use-total-btn');
        const multas = JSON.parse(calc.dataset.multas);
        const priceInput = form.querySelector('input[name="finePrice"]');
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            suggestionsDiv.innerHTML = '';
            
            if (!searchTerm) return;
            
            const matches = multas.filter(m => 
                m.numero.toString().includes(searchTerm) ||
                m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            matches.forEach(match => {
                const suggestion = document.createElement('div');
                suggestion.classList.add('fine-suggestion-calc');
                suggestion.innerHTML = `<strong>${match.numero}</strong> - ${match.descripcion} (${match.precio}€)`;
                suggestion.onclick = () => {
                    addSelectedFineCalc(calc, match, selectedDiv, totalDiv);
                    searchInput.value = '';
                    suggestionsDiv.innerHTML = '';
                };
                suggestionsDiv.appendChild(suggestion);
            });
        });
        
        // Botón para usar el total calculado
        useBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedFines = JSON.parse(calc.dataset.selectedFines || '[]');
            let totalCalc = 0;
            selectedFines.forEach(f => {
                totalCalc += f.precio;
            });
            if (totalCalc > 0 && priceInput) {
                priceInput.value = totalCalc;
                showSuccessNotification(`✓ Total de ${totalCalc}€ aplicado al precio`);
            }
        });
    });

    const firstInput = form.querySelector('input:not(.fine-search-calc), textarea');
    if (firstInput) firstInput.focus();
}

function addSelectedFineCalc(calc, fine, selectedDiv, totalDiv) {
    const selectedFines = JSON.parse(calc.dataset.selectedFines || '[]');
    selectedFines.push(fine);
    calc.dataset.selectedFines = JSON.stringify(selectedFines);
    
    renderSelectedFinesCalc(selectedDiv, totalDiv, selectedFines, calc);
}

function renderSelectedFinesCalc(selectedDiv, totalDiv, selectedFines, calc) {
    selectedDiv.innerHTML = '';
    let total = 0;
    
    selectedFines.forEach((fine, idx) => {
        total += fine.precio;
        const tag = document.createElement('div');
        tag.classList.add('fine-tag-calc');
        tag.innerHTML = `
            <span>${fine.numero} - ${fine.descripcion} (${fine.precio}€)</span>
            <button type="button" class="remove-fine-calc-btn" data-index="${idx}">×</button>
        `;
        
        const removeBtn = tag.querySelector('.remove-fine-calc-btn');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            selectedFines.splice(idx, 1);
            calc.dataset.selectedFines = JSON.stringify(selectedFines);
            renderSelectedFinesCalc(selectedDiv, totalDiv, selectedFines, calc);
        });
        
        selectedDiv.appendChild(tag);
    });
    
    totalDiv.innerHTML = `<strong>💰 Total: ${total}€</strong>`;
}

/**
 * Muestra notificación de éxito
 */
export function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'success');
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

/**
 * Muestra notificación de error
 */
export function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'error');
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 4000);
}
