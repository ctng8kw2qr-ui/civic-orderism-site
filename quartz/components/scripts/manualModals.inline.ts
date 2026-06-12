document.addEventListener("nav", () => {
  const triggers = document.querySelectorAll<HTMLElement>("[data-manual-modal]")
  const dialogs = document.querySelectorAll<HTMLDialogElement>("[data-manual-dialog]")
  let activeTrigger: HTMLElement | null = null

  const closeDialog = (dialog: HTMLDialogElement) => {
    if (!dialog.open) return
    dialog.close()
    document.documentElement.classList.remove("manual-modal-open")
    activeTrigger?.focus()
    activeTrigger = null
  }

  const openDialog = (trigger: HTMLElement) => {
    const id = trigger.dataset.manualModal
    const dialog = document.querySelector<HTMLDialogElement>(`[data-manual-dialog="${id}"]`)
    if (!dialog) return
    activeTrigger = trigger
    dialog.showModal()
    document.documentElement.classList.add("manual-modal-open")
    dialog.querySelector<HTMLElement>("[data-manual-close]")?.focus()
  }

  const onTriggerClick = (event: Event) => {
    event.preventDefault()
    openDialog(event.currentTarget as HTMLElement)
  }

  const onDialogClick = (event: MouseEvent) => {
    const dialog = event.currentTarget as HTMLDialogElement
    if (event.target === dialog) closeDialog(dialog)
  }

  const onDialogClose = () => {
    document.documentElement.classList.remove("manual-modal-open")
  }

  const onDialogCancel = (event: Event) => {
    event.preventDefault()
    closeDialog(event.currentTarget as HTMLDialogElement)
  }

  for (const trigger of triggers) {
    trigger.addEventListener("click", onTriggerClick)
    window.addCleanup(() => trigger.removeEventListener("click", onTriggerClick))
  }

  for (const dialog of dialogs) {
    dialog.addEventListener("click", onDialogClick)
    dialog.addEventListener("close", onDialogClose)
    dialog.addEventListener("cancel", onDialogCancel)
    for (const closeButton of dialog.querySelectorAll<HTMLElement>("[data-manual-close]")) {
      const onCloseClick = () => closeDialog(dialog)
      closeButton.addEventListener("click", onCloseClick)
      window.addCleanup(() => closeButton.removeEventListener("click", onCloseClick))
    }
    window.addCleanup(() => {
      dialog.removeEventListener("click", onDialogClick)
      dialog.removeEventListener("close", onDialogClose)
      dialog.removeEventListener("cancel", onDialogCancel)
      if (dialog.open) dialog.close()
    })
  }
})
