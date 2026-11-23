
const form = document.getElementById('court-form')
const courtList = document.getElementById('court-list')
const courtCounter = document.getElementById('court-counter')
const searchInput = document.getElementById('search')

const courtId = document.getElementById('court-id')
const nameInput = document.getElementById('name')
const sportInput = document.getElementById('sport')
const locationInput = document.getElementById('location')
const surfaceInput = document.getElementById('surface')
const capacityInput = document.getElementById('capacity')
const priceInput = document.getElementById('price')
const coverageInput = document.getElementById('coverage')
const statusInput = document.getElementById('status')

const submitBtn = document.getElementById('submit-btn')
const cancelBtn = document.getElementById('cancel-btn')
const formTitle = document.getElementById('form-title')
const formIcon = document.getElementById('form-icon')

let courts = JSON.parse(localStorage.getItem('courts')) || []

function saveCourts() {
  localStorage.setItem('courts', JSON.stringify(courts))
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }

    return entities[char]
  })
}

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function renderCourts() {
  const search = searchInput.value.toLowerCase().trim()

  const filteredCourts = courts.filter(court =>
    court.name.toLowerCase().includes(search) ||
    court.sport.toLowerCase().includes(search) ||
    court.location.toLowerCase().includes(search)
  )

  courtCounter.textContent =
    `${courts.length} ${courts.length === 1 ? 'quadra' : 'quadras'}`

  if (filteredCourts.length === 0) {
    courtList.innerHTML = `
      <div class="estado-vazio">
        <i class="ph ph-basketball"></i>
        <h3>${courts.length === 0
          ? 'Nenhuma quadra cadastrada'
          : 'Nenhuma quadra encontrada'}</h3>
        <p>${courts.length === 0
          ? 'Cadastre uma nova quadra para começar.'
          : 'Tente pesquisar utilizando outro termo.'}</p>
      </div>
    `

    return
  }

  courtList.innerHTML = filteredCourts.map(court => `
    <article class="item-quadra">

      <div class="informacoes-quadra">

        <h3>${escapeHTML(court.name)}</h3>

        <span class="status ${court.status === 'Ativa' ? 'ativa' : 'inativa'}">
          ${escapeHTML(court.status)}
        </span>

        <p>
          <i class="ph ph-map-pin"></i>
          ${escapeHTML(court.location)}
        </p>

        <div class="detalhes-quadra">
          <span class="etiqueta-detalhe">${escapeHTML(court.sport)}</span>
          <span class="etiqueta-detalhe">${escapeHTML(court.surface)}</span>
          <span class="etiqueta-detalhe">${escapeHTML(court.coverage)}</span>
          <span class="etiqueta-detalhe">${escapeHTML(court.capacity)} pessoas</span>
          <span class="etiqueta-detalhe">${formatPrice(court.price)}/hora</span>
        </div>

      </div>

      <div class="acoes-quadra">

        <button class="botao-editar" data-action="edit" data-id="${escapeHTML(court.id)}" type="button">
          <i class="ph ph-pencil-simple"></i>
          Editar
        </button>

        <button class="botao-excluir" data-action="delete" data-id="${escapeHTML(court.id)}" type="button">
          <i class="ph ph-trash"></i>
          Excluir
        </button>

      </div>

    </article>
  `).join('')
}

form.addEventListener('submit', event => {
  event.preventDefault()

  const id = courtId.value

  const courtData = {
    id: id || crypto.randomUUID(),
    name: nameInput.value.trim(),
    sport: sportInput.value,
    location: locationInput.value.trim(),
    surface: surfaceInput.value,
    capacity: Number(capacityInput.value),
    price: Number(priceInput.value),
    coverage: coverageInput.value,
    status: statusInput.value
  }

  if (
    !courtData.name ||
    !courtData.location ||
    courtData.capacity < 1 ||
    !Number.isFinite(courtData.price) ||
    courtData.price < 0
  ) {
    alert('Verifique os dados informados.')
    return
  }

  if (id) {
    courts = courts.map(court =>
      court.id === id ? courtData : court
    )

    alert('Quadra atualizada com sucesso!')
  } else {
    courts.push(courtData)

    alert('Quadra cadastrada com sucesso!')
  }

  saveCourts()
  renderCourts()
  resetForm()
})

function editCourt(id) {
  const court = courts.find(court => court.id === id)

  if (!court) return

  courtId.value = court.id
  nameInput.value = court.name
  sportInput.value = court.sport
  locationInput.value = court.location
  surfaceInput.value = court.surface
  capacityInput.value = court.capacity
  priceInput.value = court.price
  coverageInput.value = court.coverage
  statusInput.value = court.status

  formTitle.textContent = 'Editar Quadra'
  formIcon.className = 'ph ph-pencil-simple icone-secao'

  submitBtn.innerHTML = `
    <i class="ph ph-floppy-disk"></i>
    Salvar Alterações
  `

  cancelBtn.hidden = false

  form.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

function deleteCourt(id) {
  const court = courts.find(court => court.id === id)

  if (!court) return

  const confirmation = confirm(
    `Deseja realmente excluir a quadra "${court.name}"?\n\nEssa ação não poderá ser desfeita.`
  )

  if (!confirmation) return

  courts = courts.filter(court => court.id !== id)

  saveCourts()
  renderCourts()

  if (courtId.value === id) {
    resetForm()
  }

  alert('Quadra excluída com sucesso!')
}

courtList.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]')

  if (!button) return

  const id = button.dataset.id

  if (button.dataset.action === 'edit') {
    editCourt(id)
  }

  if (button.dataset.action === 'delete') {
    deleteCourt(id)
  }
})

function resetForm() {
  form.reset()
  courtId.value = ''

  formTitle.textContent = 'Cadastrar Nova Quadra'
  formIcon.className = 'ph ph-plus-circle icone-secao'

  submitBtn.innerHTML = `
    <i class="ph ph-plus"></i>
    Cadastrar Quadra
  `

  cancelBtn.hidden = true
}

cancelBtn.addEventListener('click', resetForm)

searchInput.addEventListener('input', renderCourts)

renderCourts()
