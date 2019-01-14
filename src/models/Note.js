module.exports = {
  "note_id": {
    type: "number",
    required: true
  },
  "title": {
    type: "string",
    required: true
  },
  "content": {
    type: "string",
    required: true
  },
  "created_at": {
    readonly: true,
    optional: true,
    type: "DateTime"
  },
  "modified_at": {
    readonly: true,
    type: "DateTime",
    optional: true
  }
};