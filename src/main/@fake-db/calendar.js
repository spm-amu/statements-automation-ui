/*eslint-disable */
import mock from './mock'

const date = new Date()
const prevDay = new Date().getDate() - 1
const nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

// prettier-ignore
const nextMonth = date.getMonth() === 11 ? new Date(date.getFullYear() + 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() + 1, 1)
// prettier-ignore
const prevMonth = date.getMonth() === 11 ? new Date(date.getFullYear() - 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() - 1, 1)

const data = {
  events: [
    {
      "id": "3553846c-26ca-4aa9-b346-0d2ab85de97a",
      "title": "Meeting 5",
      "start": "2022-09-07T00:00:00",
      "end": "2022-09-07T00:00:00",
      "allDay": false,
      "extendedProps": {
        "description": "Meeting Description",
        "attendees": [
          {
            "id": "1f94b7f6-1bd1-48ab-9cab-57dd1c9171da",
            "identifier": "GabrielleRobertson",
            "name": "Gabrielle Robertson",
            "optional": false
          }
        ],
        "schedule": {
          "id": "52bd0fa6-f35f-489d-b8b6-1afd8cb06932",
          "startDate": "2022-09-07",
          "endDate": "2022-09-07",
          "startTime": "00:00:00",
          "endTime": "00:00:00"
        },
        "location": {
          "id": "4fae0a92-6de7-4750-8213-a19e724abd00",
          "name": "ROOM 2B"
        }
      }
    }
  ]
}

// ------------------------------------------------
// GET: Return calendar events
// ------------------------------------------------
mock.onGet('/apps/calendar/events').reply(config => {
  return [200, data.events]
})

// ------------------------------------------------
// POST: Add new event
// ------------------------------------------------
mock.onPost('/apps/calendar/add-event').reply(config => {
  // Get event from post data
  const { event } = JSON.parse(config.data)

  const { length } = data.events
  let lastIndex = 0
  if (length) {
    lastIndex = data.events[length - 1].id
  }
  event.id = lastIndex + 1

  data.events.push(event)

  return [201, { event }]
})

// ------------------------------------------------
// POST: Update Event
// ------------------------------------------------
mock.onPost('/apps/calendar/update-event').reply(config => {
  const { event: eventData } = JSON.parse(config.data)

  // Convert Id to number
  eventData.id = Number(eventData.id)

  const event = data.events.find(ev => ev.id === Number(eventData.id))
  Object.assign(event, eventData)

  return [200, { event }]
})

// ------------------------------------------------
// DELETE: Remove Event
// ------------------------------------------------
mock.onDelete('/apps/calendar/remove-event').reply(config => {
  // Get event id from URL
  let { id } = config

  // Convert Id to number
  const eventId = Number(id)

  const eventIndex = data.events.findIndex(ev => ev.id === eventId)
  data.events.splice(eventIndex, 1)
  return [200]
})
