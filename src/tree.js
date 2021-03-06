export default {
  bookmarks: {
    _type: "application/vnd.oada.bookmarks.1+json",
    _rev: 0,
    fields: {
      _type: "application/vnd.oada.fields.1+json",
      _rev: 0,
      fields: {
        "*": {
          _type: "application/vnd.oada.field.1+json",
          _rev: 0,
        }
      },
      farms: {
        "*": {
          _type: "application/vnd.oada.farm.1+json",
          _rev: 0,
          grower: {
            _type: "application/vnd.oada.fields.1+json",
          }
        }
      },
      growers: {
        "*": {
          _type: 'application/vnd.oada.fields.1+json',
          _rev: 0
        }
      }
    },
  }
}


