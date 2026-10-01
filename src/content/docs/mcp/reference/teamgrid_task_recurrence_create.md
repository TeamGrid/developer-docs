---
title: teamgrid_task_recurrence_create
description: "Input schema, permissions, API mapping and write behavior for teamgrid_task_recurrence_create."
owner: Developer Platform
reviewedAt: 2026-10-01
---

`teamgrid_task_recurrence_create` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `tasks-write`.

Create a task recurrence. Changes the selected workspace under current API permissions. Reuse the same idempotencyKey and payload for the same intent. Changes can affect future automated actions; inspect the definition and schedule first.

## Input schema

**Stable release:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

```json
{
  "type": "object",
  "properties": {
    "workspaceId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128,
      "description": "Workspace returned by teamgrid_workspace_get and selected for this exact action."
    },
    "idempotencyKey": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128,
      "pattern": "^[\\x21-\\x7e]+$",
      "description": "Stable key for this exact intent. Retain and reuse the same key and payload after a timeout; a timeout does not prove failure."
    },
    "data": {
      "additionalProperties": false,
      "oneOf": [
        {
          "required": [
            "sourceTaskId"
          ]
        },
        {
          "required": [
            "template"
          ]
        }
      ],
      "properties": {
        "changeReason": {
          "maxLength": 1000,
          "type": "string",
          "description": "The change reason associated with this task recurrence."
        },
        "name": {
          "maxLength": 1000,
          "type": "string",
          "description": "Human-readable name of the resource."
        },
        "policy": {
          "additionalProperties": false,
          "description": "The policy associated with this task recurrence.",
          "properties": {
            "candidates": {
              "oneOf": [
                {
                  "additionalProperties": false,
                  "properties": {
                    "nodeId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The node id associated with this task recurrence candidate source."
                    },
                    "op": {
                      "const": "calendarRule",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "rule": {
                      "additionalProperties": false,
                      "properties": {
                        "byHour": {
                          "items": {
                            "maximum": 23,
                            "minimum": 0,
                            "type": "integer"
                          },
                          "maxItems": 24,
                          "type": "array",
                          "description": "The by hour associated with this task recurrence calendar rule."
                        },
                        "byMinute": {
                          "items": {
                            "maximum": 59,
                            "minimum": 0,
                            "type": "integer"
                          },
                          "maxItems": 60,
                          "type": "array",
                          "description": "The by minute associated with this task recurrence calendar rule."
                        },
                        "byMonth": {
                          "items": {
                            "maximum": 12,
                            "minimum": 1,
                            "type": "integer"
                          },
                          "maxItems": 12,
                          "type": "array",
                          "description": "The by month associated with this task recurrence calendar rule."
                        },
                        "byMonthDay": {
                          "items": {
                            "maximum": 31,
                            "minimum": -31,
                            "not": {
                              "const": 0
                            },
                            "type": "integer"
                          },
                          "maxItems": 62,
                          "type": "array",
                          "description": "The by month day associated with this task recurrence calendar rule."
                        },
                        "bySetPosition": {
                          "items": {
                            "maximum": 366,
                            "minimum": -366,
                            "not": {
                              "const": 0
                            },
                            "type": "integer"
                          },
                          "maxItems": 732,
                          "type": "array",
                          "description": "The by set position associated with this task recurrence calendar rule."
                        },
                        "byWeekDay": {
                          "items": {
                            "maximum": 6,
                            "minimum": 0,
                            "type": "integer"
                          },
                          "maxItems": 7,
                          "type": "array",
                          "description": "The by week day associated with this task recurrence calendar rule."
                        },
                        "frequency": {
                          "enum": [
                            "minutely",
                            "hourly",
                            "daily",
                            "weekly",
                            "monthly",
                            "yearly"
                          ],
                          "type": "string",
                          "description": "Canonical frequency value for this task recurrence calendar rule."
                        },
                        "interval": {
                          "default": 1,
                          "maximum": 1000000,
                          "minimum": 1,
                          "type": "integer",
                          "description": "The interval associated with this task recurrence calendar rule."
                        },
                        "invalidDayHandling": {
                          "enum": [
                            "next-valid-day",
                            "omit",
                            "previous-valid-day"
                          ],
                          "type": "string",
                          "description": "Canonical invalid day handling value for this task recurrence calendar rule."
                        },
                        "startLocal": {
                          "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?$",
                          "type": "string",
                          "description": "The start local associated with this task recurrence calendar rule."
                        },
                        "weekStart": {
                          "maximum": 6,
                          "minimum": 0,
                          "type": "integer",
                          "description": "The week start associated with this task recurrence calendar rule."
                        }
                      },
                      "required": [
                        "frequency",
                        "startLocal"
                      ],
                      "type": "object",
                      "description": "The rule associated with this task recurrence candidate source."
                    }
                  },
                  "required": [
                    "nodeId",
                    "op",
                    "rule"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "nodeId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The node id associated with this task recurrence candidate source."
                    },
                    "op": {
                      "const": "dateSet",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "dates": {
                      "items": {
                        "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?$",
                        "type": "string"
                      },
                      "maxItems": 500,
                      "minItems": 1,
                      "type": "array",
                      "description": "The dates associated with this task recurrence candidate source."
                    }
                  },
                  "required": [
                    "nodeId",
                    "op",
                    "dates"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "nodeId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The node id associated with this task recurrence candidate source."
                    },
                    "op": {
                      "const": "monthSet",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "months": {
                      "items": {
                        "maximum": 12,
                        "minimum": 1,
                        "type": "integer"
                      },
                      "maxItems": 12,
                      "minItems": 1,
                      "type": "array",
                      "description": "The months associated with this task recurrence candidate source."
                    }
                  },
                  "required": [
                    "nodeId",
                    "op",
                    "months"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "nodeId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The node id associated with this task recurrence candidate source."
                    },
                    "op": {
                      "const": "sequence",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "anchorLocal": {
                      "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?$",
                      "type": "string",
                      "description": "The anchor local associated with this task recurrence candidate source."
                    },
                    "intervals": {
                      "items": {
                        "allOf": [
                          {
                            "additionalProperties": false,
                            "allOf": [
                              {
                                "if": {
                                  "properties": {
                                    "unit": {
                                      "const": "business-day"
                                    }
                                  },
                                  "required": [
                                    "unit"
                                  ]
                                },
                                "then": {
                                  "properties": {
                                    "value": {
                                      "maximum": 10000,
                                      "minimum": -10000,
                                      "type": "integer"
                                    }
                                  }
                                }
                              }
                            ],
                            "properties": {
                              "unit": {
                                "enum": [
                                  "minute",
                                  "hour",
                                  "day",
                                  "week",
                                  "month",
                                  "year",
                                  "business-day"
                                ],
                                "type": "string",
                                "description": "Canonical unit value for this task recurrence duration."
                              },
                              "value": {
                                "maximum": 1000000,
                                "minimum": -1000000,
                                "type": "integer",
                                "description": "Canonical value represented by this field."
                              }
                            },
                            "required": [
                              "unit",
                              "value"
                            ],
                            "type": "object",
                            "description": "Public API representation of task recurrence duration."
                          },
                          {
                            "properties": {
                              "value": {
                                "minimum": 0,
                                "type": "integer",
                                "description": "Canonical value represented by this field."
                              }
                            },
                            "type": "object"
                          }
                        ]
                      },
                      "maxItems": 500,
                      "minItems": 1,
                      "type": "array",
                      "description": "The intervals associated with this task recurrence candidate source."
                    }
                  },
                  "required": [
                    "nodeId",
                    "op",
                    "anchorLocal",
                    "intervals"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "nodeId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The node id associated with this task recurrence candidate source."
                    },
                    "op": {
                      "const": "afterOccurrenceEvent",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "completionMode": {
                      "enum": [
                        "every-completion-transition",
                        "first-completion-only"
                      ],
                      "type": "string",
                      "description": "Canonical completion mode value for this task recurrence candidate source."
                    },
                    "delay": {
                      "allOf": [
                        {
                          "additionalProperties": false,
                          "allOf": [
                            {
                              "if": {
                                "properties": {
                                  "unit": {
                                    "const": "business-day"
                                  }
                                },
                                "required": [
                                  "unit"
                                ]
                              },
                              "then": {
                                "properties": {
                                  "value": {
                                    "maximum": 10000,
                                    "minimum": -10000,
                                    "type": "integer"
                                  }
                                }
                              }
                            }
                          ],
                          "properties": {
                            "unit": {
                              "enum": [
                                "minute",
                                "hour",
                                "day",
                                "week",
                                "month",
                                "year",
                                "business-day"
                              ],
                              "type": "string",
                              "description": "Canonical unit value for this task recurrence duration."
                            },
                            "value": {
                              "maximum": 1000000,
                              "minimum": -1000000,
                              "type": "integer",
                              "description": "Canonical value represented by this field."
                            }
                          },
                          "required": [
                            "unit",
                            "value"
                          ],
                          "type": "object",
                          "description": "Public API representation of task recurrence duration."
                        },
                        {
                          "properties": {
                            "value": {
                              "minimum": 0,
                              "type": "integer",
                              "description": "Canonical value represented by this field."
                            }
                          },
                          "type": "object"
                        }
                      ],
                      "description": "The delay associated with this task recurrence candidate source."
                    },
                    "event": {
                      "enum": [
                        "completed",
                        "created",
                        "reopened"
                      ],
                      "type": "string",
                      "description": "Canonical TeamGrid event name."
                    }
                  },
                  "required": [
                    "nodeId",
                    "op",
                    "event"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "nodeId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The node id associated with this task recurrence candidate source."
                    },
                    "op": {
                      "const": "afterProjectEvent",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "delay": {
                      "allOf": [
                        {
                          "additionalProperties": false,
                          "allOf": [
                            {
                              "if": {
                                "properties": {
                                  "unit": {
                                    "const": "business-day"
                                  }
                                },
                                "required": [
                                  "unit"
                                ]
                              },
                              "then": {
                                "properties": {
                                  "value": {
                                    "maximum": 10000,
                                    "minimum": -10000,
                                    "type": "integer"
                                  }
                                }
                              }
                            }
                          ],
                          "properties": {
                            "unit": {
                              "enum": [
                                "minute",
                                "hour",
                                "day",
                                "week",
                                "month",
                                "year",
                                "business-day"
                              ],
                              "type": "string",
                              "description": "Canonical unit value for this task recurrence duration."
                            },
                            "value": {
                              "maximum": 1000000,
                              "minimum": -1000000,
                              "type": "integer",
                              "description": "Canonical value represented by this field."
                            }
                          },
                          "required": [
                            "unit",
                            "value"
                          ],
                          "type": "object",
                          "description": "Public API representation of task recurrence duration."
                        },
                        {
                          "properties": {
                            "value": {
                              "minimum": 0,
                              "type": "integer",
                              "description": "Canonical value represented by this field."
                            }
                          },
                          "type": "object"
                        }
                      ],
                      "description": "The delay associated with this task recurrence candidate source."
                    },
                    "event": {
                      "enum": [
                        "archived",
                        "completed",
                        "created",
                        "reopened",
                        "restored"
                      ],
                      "type": "string",
                      "description": "Canonical TeamGrid event name."
                    },
                    "projectId": {
                      "maxLength": 256,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "Identifier of the related project."
                    }
                  },
                  "required": [
                    "nodeId",
                    "op",
                    "event",
                    "projectId"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "nodeId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The node id associated with this task recurrence candidate source."
                    },
                    "op": {
                      "const": "externalEvent",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "delay": {
                      "allOf": [
                        {
                          "additionalProperties": false,
                          "allOf": [
                            {
                              "if": {
                                "properties": {
                                  "unit": {
                                    "const": "business-day"
                                  }
                                },
                                "required": [
                                  "unit"
                                ]
                              },
                              "then": {
                                "properties": {
                                  "value": {
                                    "maximum": 10000,
                                    "minimum": -10000,
                                    "type": "integer"
                                  }
                                }
                              }
                            }
                          ],
                          "properties": {
                            "unit": {
                              "enum": [
                                "minute",
                                "hour",
                                "day",
                                "week",
                                "month",
                                "year",
                                "business-day"
                              ],
                              "type": "string",
                              "description": "Canonical unit value for this task recurrence duration."
                            },
                            "value": {
                              "maximum": 1000000,
                              "minimum": -1000000,
                              "type": "integer",
                              "description": "Canonical value represented by this field."
                            }
                          },
                          "required": [
                            "unit",
                            "value"
                          ],
                          "type": "object",
                          "description": "Public API representation of task recurrence duration."
                        },
                        {
                          "properties": {
                            "value": {
                              "minimum": 0,
                              "type": "integer",
                              "description": "Canonical value represented by this field."
                            }
                          },
                          "type": "object"
                        }
                      ],
                      "description": "The delay associated with this task recurrence candidate source."
                    },
                    "eventType": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z][A-Za-z0-9_.:-]{0,127}$",
                      "type": "string",
                      "description": "The event type associated with this task recurrence candidate source."
                    },
                    "sourceId": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "The source id associated with this task recurrence candidate source."
                    }
                  },
                  "required": [
                    "nodeId",
                    "op",
                    "eventType"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "op": {
                      "const": "union",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "sources": {
                      "items": {
                        "$ref": "#/$defs/TaskRecurrenceCandidateSource"
                      },
                      "maxItems": 32,
                      "minItems": 1,
                      "type": "array",
                      "description": "The sources associated with this task recurrence candidate source."
                    }
                  },
                  "required": [
                    "op",
                    "sources"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "op": {
                      "const": "intersection",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "sources": {
                      "items": {
                        "$ref": "#/$defs/TaskRecurrenceCandidateSource"
                      },
                      "maxItems": 32,
                      "minItems": 1,
                      "type": "array",
                      "description": "The sources associated with this task recurrence candidate source."
                    }
                  },
                  "required": [
                    "op",
                    "sources"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "op": {
                      "const": "difference",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "exclude": {
                      "$ref": "#/$defs/TaskRecurrenceCandidateSource"
                    },
                    "include": {
                      "$ref": "#/$defs/TaskRecurrenceCandidateSource"
                    }
                  },
                  "required": [
                    "op",
                    "exclude",
                    "include"
                  ],
                  "type": "object"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "op": {
                      "const": "deduplicate",
                      "type": "string",
                      "description": "The op associated with this task recurrence candidate source."
                    },
                    "granularity": {
                      "enum": [
                        "instant",
                        "day",
                        "minute"
                      ],
                      "type": "string",
                      "description": "Canonical granularity value for this task recurrence candidate source."
                    },
                    "source": {
                      "$ref": "#/$defs/TaskRecurrenceCandidateSource"
                    }
                  },
                  "required": [
                    "op",
                    "granularity",
                    "source"
                  ],
                  "type": "object"
                }
              ],
              "description": "The candidates associated with this task recurrence policy."
            },
            "conditions": {
              "items": {
                "oneOf": [
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "all",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "conditions": {
                        "items": {
                          "$ref": "#/$defs/TaskRecurrenceCondition"
                        },
                        "maxItems": 64,
                        "type": "array",
                        "description": "The conditions associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "conditions"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "any",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "conditions": {
                        "items": {
                          "$ref": "#/$defs/TaskRecurrenceCondition"
                        },
                        "maxItems": 64,
                        "type": "array",
                        "description": "The conditions associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "conditions"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "not",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "condition": {
                        "$ref": "#/$defs/TaskRecurrenceCondition"
                      }
                    },
                    "required": [
                      "op",
                      "condition"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "exists",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "value": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "Canonical value represented by this field."
                      }
                    },
                    "required": [
                      "op",
                      "value"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "eq",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "left": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The left associated with this task recurrence condition."
                      },
                      "right": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The right associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "left",
                      "right"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "neq",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "left": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The left associated with this task recurrence condition."
                      },
                      "right": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The right associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "left",
                      "right"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "lt",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "left": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The left associated with this task recurrence condition."
                      },
                      "right": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The right associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "left",
                      "right"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "lte",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "left": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The left associated with this task recurrence condition."
                      },
                      "right": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The right associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "left",
                      "right"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "gt",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "left": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The left associated with this task recurrence condition."
                      },
                      "right": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The right associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "left",
                      "right"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "gte",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "left": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The left associated with this task recurrence condition."
                      },
                      "right": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The right associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "left",
                      "right"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "in",
                        "type": "string",
                        "description": "The op associated with this task recurrence condition."
                      },
                      "left": {
                        "oneOf": [
                          {
                            "type": [
                              "boolean",
                              "number",
                              "string",
                              "null"
                            ]
                          },
                          {
                            "additionalProperties": false,
                            "properties": {
                              "ref": {
                                "maxLength": 256,
                                "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                "type": "string",
                                "description": "The ref associated with this task recurrence condition value."
                              }
                            },
                            "required": [
                              "ref"
                            ],
                            "type": "object"
                          }
                        ],
                        "description": "The left associated with this task recurrence condition."
                      },
                      "right": {
                        "items": {
                          "oneOf": [
                            {
                              "type": [
                                "boolean",
                                "number",
                                "string",
                                "null"
                              ]
                            },
                            {
                              "additionalProperties": false,
                              "properties": {
                                "ref": {
                                  "maxLength": 256,
                                  "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                                  "type": "string",
                                  "description": "The ref associated with this task recurrence condition value."
                                }
                              },
                              "required": [
                                "ref"
                              ],
                              "type": "object"
                            }
                          ],
                          "description": "Public API representation of task recurrence condition value."
                        },
                        "maxItems": 100,
                        "type": "array",
                        "description": "The right associated with this task recurrence condition."
                      }
                    },
                    "required": [
                      "op",
                      "left",
                      "right"
                    ],
                    "type": "object"
                  }
                ],
                "description": "Public API representation of task recurrence condition."
              },
              "maxItems": 64,
              "type": "array",
              "description": "The conditions associated with this task recurrence policy."
            },
            "engineVersion": {
              "const": "recurrence-v1",
              "type": "string",
              "description": "The engine version associated with this task recurrence policy."
            },
            "limits": {
              "additionalProperties": false,
              "properties": {
                "maxOccurrences": {
                  "minimum": 1,
                  "type": [
                    "integer",
                    "null"
                  ],
                  "description": "The max occurrences associated with this task recurrence policy limits."
                },
                "until": {
                  "maxLength": 32,
                  "type": [
                    "string",
                    "null"
                  ],
                  "description": "The until associated with this task recurrence policy limits."
                }
              },
              "required": [
                "maxOccurrences",
                "until"
              ],
              "type": "object",
              "description": "The limits associated with this task recurrence policy."
            },
            "materialization": {
              "additionalProperties": false,
              "allOf": [
                {
                  "else": {
                    "properties": {
                      "catchUpLimit": false
                    }
                  },
                  "if": {
                    "properties": {
                      "catchUp": {
                        "const": "bounded"
                      }
                    },
                    "required": [
                      "catchUp"
                    ]
                  },
                  "then": {
                    "properties": {
                      "catchUpLimit": {
                        "maximum": 100,
                        "minimum": 1,
                        "type": "integer"
                      }
                    },
                    "required": [
                      "catchUpLimit"
                    ]
                  }
                }
              ],
              "properties": {
                "catchUp": {
                  "enum": [
                    "all",
                    "bounded",
                    "latest",
                    "none"
                  ],
                  "type": "string",
                  "description": "Canonical catch up value for this task recurrence policy materialization."
                },
                "catchUpLimit": {
                  "maximum": 100,
                  "minimum": 1,
                  "type": "integer",
                  "description": "The catch up limit associated with this task recurrence policy materialization."
                },
                "lead": {
                  "allOf": [
                    {
                      "additionalProperties": false,
                      "allOf": [
                        {
                          "if": {
                            "properties": {
                              "unit": {
                                "const": "business-day"
                              }
                            },
                            "required": [
                              "unit"
                            ]
                          },
                          "then": {
                            "properties": {
                              "value": {
                                "maximum": 10000,
                                "minimum": -10000,
                                "type": "integer"
                              }
                            }
                          }
                        }
                      ],
                      "properties": {
                        "unit": {
                          "enum": [
                            "minute",
                            "hour",
                            "day",
                            "week",
                            "month",
                            "year",
                            "business-day"
                          ],
                          "type": "string",
                          "description": "Canonical unit value for this task recurrence duration."
                        },
                        "value": {
                          "maximum": 1000000,
                          "minimum": -1000000,
                          "type": "integer",
                          "description": "Canonical value represented by this field."
                        }
                      },
                      "required": [
                        "unit",
                        "value"
                      ],
                      "type": "object",
                      "description": "Public API representation of task recurrence duration."
                    },
                    {
                      "properties": {
                        "value": {
                          "minimum": 0,
                          "type": "integer",
                          "description": "Canonical value represented by this field."
                        }
                      },
                      "type": "object"
                    }
                  ],
                  "description": "The lead associated with this task recurrence policy materialization."
                },
                "overlap": {
                  "enum": [
                    "allow",
                    "defer",
                    "latest-only",
                    "pause-series",
                    "skip"
                  ],
                  "type": "string",
                  "description": "Canonical overlap value for this task recurrence policy materialization."
                }
              },
              "required": [
                "catchUp",
                "lead",
                "overlap"
              ],
              "type": "object",
              "description": "The materialization associated with this task recurrence policy."
            },
            "schemaVersion": {
              "const": 1,
              "type": "integer",
              "description": "The schema version associated with this task recurrence policy."
            },
            "timeBasis": {
              "additionalProperties": false,
              "properties": {
                "disambiguation": {
                  "enum": [
                    "compatible",
                    "earlier",
                    "later",
                    "reject"
                  ],
                  "type": "string",
                  "description": "Canonical disambiguation value for this task recurrence policy time basis."
                },
                "mode": {
                  "enum": [
                    "elapsed",
                    "wall-clock"
                  ],
                  "type": "string",
                  "description": "Canonical mode value for this task recurrence policy time basis."
                },
                "timeZone": {
                  "maxLength": 128,
                  "minLength": 1,
                  "type": "string",
                  "description": "The time zone associated with this task recurrence policy time basis."
                }
              },
              "required": [
                "disambiguation",
                "mode",
                "timeZone"
              ],
              "type": "object",
              "description": "The time basis associated with this task recurrence policy."
            },
            "transforms": {
              "items": {
                "oneOf": [
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "offset",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "unit": {
                        "enum": [
                          "minute",
                          "hour",
                          "day",
                          "week",
                          "month",
                          "year",
                          "business-day"
                        ],
                        "type": "string",
                        "description": "Canonical unit value for this task recurrence transform."
                      },
                      "unitMode": {
                        "enum": [
                          "elapsed",
                          "wall-clock"
                        ],
                        "type": "string",
                        "description": "Canonical unit mode value for this task recurrence transform."
                      },
                      "value": {
                        "maximum": 1000000,
                        "minimum": -1000000,
                        "type": "integer",
                        "description": "Canonical value represented by this field."
                      }
                    },
                    "required": [
                      "op",
                      "unit",
                      "value"
                    ],
                    "type": "object",
                    "allOf": [
                      {
                        "if": {
                          "properties": {
                            "unit": {
                              "const": "business-day"
                            }
                          },
                          "required": [
                            "unit"
                          ]
                        },
                        "then": {
                          "properties": {
                            "value": {
                              "maximum": 10000,
                              "minimum": -10000,
                              "type": "integer"
                            }
                          }
                        }
                      }
                    ]
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "nthBusinessDay",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "calendarBinding": {
                        "enum": [
                          "assignee",
                          "project",
                          "series"
                        ],
                        "type": "string",
                        "description": "Canonical calendar binding value for this task recurrence transform."
                      },
                      "period": {
                        "enum": [
                          "month",
                          "quarter",
                          "year"
                        ],
                        "type": "string",
                        "description": "Canonical period value for this task recurrence transform."
                      },
                      "position": {
                        "maximum": 366,
                        "minimum": -366,
                        "not": {
                          "const": 0
                        },
                        "type": "integer",
                        "description": "The position associated with this task recurrence transform."
                      }
                    },
                    "required": [
                      "op",
                      "period",
                      "position"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "shiftToBusinessTime",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "calendarBinding": {
                        "enum": [
                          "assignee",
                          "project",
                          "series"
                        ],
                        "type": "string",
                        "description": "Canonical calendar binding value for this task recurrence transform."
                      },
                      "direction": {
                        "enum": [
                          "next",
                          "previous"
                        ],
                        "type": "string",
                        "description": "Canonical direction value for this task recurrence transform."
                      },
                      "includeAbsences": {
                        "type": "boolean",
                        "description": "Whether include absences applies to this task recurrence transform."
                      }
                    },
                    "required": [
                      "op",
                      "direction"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "snapToWorkingTime",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "calendarBinding": {
                        "enum": [
                          "assignee",
                          "project",
                          "series"
                        ],
                        "type": "string",
                        "description": "Canonical calendar binding value for this task recurrence transform."
                      },
                      "direction": {
                        "enum": [
                          "next",
                          "previous"
                        ],
                        "type": "string",
                        "description": "Canonical direction value for this task recurrence transform."
                      },
                      "includeAbsences": {
                        "type": "boolean",
                        "description": "Whether include absences applies to this task recurrence transform."
                      }
                    },
                    "required": [
                      "op",
                      "direction"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "setLocalTime",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "hour": {
                        "maximum": 23,
                        "minimum": 0,
                        "type": "integer",
                        "description": "The hour associated with this task recurrence transform."
                      },
                      "minute": {
                        "maximum": 59,
                        "minimum": 0,
                        "type": "integer",
                        "description": "The minute associated with this task recurrence transform."
                      }
                    },
                    "required": [
                      "op",
                      "hour",
                      "minute"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "limit",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "count": {
                        "maximum": 1000000,
                        "minimum": 1,
                        "type": "integer",
                        "description": "The count associated with this task recurrence transform."
                      },
                      "start": {
                        "maxLength": 32,
                        "minLength": 10,
                        "type": "string",
                        "description": "Start timestamp of the represented interval."
                      },
                      "until": {
                        "maxLength": 32,
                        "minLength": 10,
                        "type": "string",
                        "description": "The until associated with this task recurrence transform."
                      }
                    },
                    "required": [
                      "op"
                    ],
                    "type": "object",
                    "anyOf": [
                      {
                        "properties": {
                          "count": {
                            "type": "integer",
                            "description": "The count associated with this task recurrence transform."
                          }
                        },
                        "required": [
                          "count"
                        ],
                        "type": "object"
                      },
                      {
                        "properties": {
                          "start": {
                            "type": "string",
                            "description": "Start timestamp of the represented interval."
                          }
                        },
                        "required": [
                          "start"
                        ],
                        "type": "object"
                      },
                      {
                        "properties": {
                          "until": {
                            "type": "string",
                            "description": "The until associated with this task recurrence transform."
                          }
                        },
                        "required": [
                          "until"
                        ],
                        "type": "object"
                      }
                    ]
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "excludeDateSet",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "dates": {
                        "items": {
                          "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                          "type": "string"
                        },
                        "maxItems": 500,
                        "minItems": 1,
                        "type": "array",
                        "description": "The dates associated with this task recurrence transform."
                      }
                    },
                    "required": [
                      "op",
                      "dates"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "excludePeriod",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "end": {
                        "maxLength": 32,
                        "minLength": 10,
                        "type": "string",
                        "description": "End timestamp of the represented interval."
                      },
                      "start": {
                        "maxLength": 32,
                        "minLength": 10,
                        "type": "string",
                        "description": "Start timestamp of the represented interval."
                      }
                    },
                    "required": [
                      "op",
                      "end",
                      "start"
                    ],
                    "type": "object"
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "op": {
                        "const": "mapToDueAndPlanningDates",
                        "type": "string",
                        "description": "The op associated with this task recurrence transform."
                      },
                      "dueOffset": {
                        "additionalProperties": false,
                        "allOf": [
                          {
                            "if": {
                              "properties": {
                                "unit": {
                                  "const": "business-day"
                                }
                              },
                              "required": [
                                "unit"
                              ]
                            },
                            "then": {
                              "properties": {
                                "value": {
                                  "maximum": 10000,
                                  "minimum": -10000,
                                  "type": "integer"
                                }
                              }
                            }
                          }
                        ],
                        "properties": {
                          "unit": {
                            "enum": [
                              "minute",
                              "hour",
                              "day",
                              "week",
                              "month",
                              "year",
                              "business-day"
                            ],
                            "type": "string",
                            "description": "Canonical unit value for this task recurrence duration."
                          },
                          "value": {
                            "maximum": 1000000,
                            "minimum": -1000000,
                            "type": "integer",
                            "description": "Canonical value represented by this field."
                          }
                        },
                        "required": [
                          "unit",
                          "value"
                        ],
                        "type": "object",
                        "description": "The due offset associated with this task recurrence transform."
                      },
                      "plannedEndOffset": {
                        "additionalProperties": false,
                        "allOf": [
                          {
                            "if": {
                              "properties": {
                                "unit": {
                                  "const": "business-day"
                                }
                              },
                              "required": [
                                "unit"
                              ]
                            },
                            "then": {
                              "properties": {
                                "value": {
                                  "maximum": 10000,
                                  "minimum": -10000,
                                  "type": "integer"
                                }
                              }
                            }
                          }
                        ],
                        "properties": {
                          "unit": {
                            "enum": [
                              "minute",
                              "hour",
                              "day",
                              "week",
                              "month",
                              "year",
                              "business-day"
                            ],
                            "type": "string",
                            "description": "Canonical unit value for this task recurrence duration."
                          },
                          "value": {
                            "maximum": 1000000,
                            "minimum": -1000000,
                            "type": "integer",
                            "description": "Canonical value represented by this field."
                          }
                        },
                        "required": [
                          "unit",
                          "value"
                        ],
                        "type": "object",
                        "description": "The planned end offset associated with this task recurrence transform."
                      },
                      "plannedStartOffset": {
                        "additionalProperties": false,
                        "allOf": [
                          {
                            "if": {
                              "properties": {
                                "unit": {
                                  "const": "business-day"
                                }
                              },
                              "required": [
                                "unit"
                              ]
                            },
                            "then": {
                              "properties": {
                                "value": {
                                  "maximum": 10000,
                                  "minimum": -10000,
                                  "type": "integer"
                                }
                              }
                            }
                          }
                        ],
                        "properties": {
                          "unit": {
                            "enum": [
                              "minute",
                              "hour",
                              "day",
                              "week",
                              "month",
                              "year",
                              "business-day"
                            ],
                            "type": "string",
                            "description": "Canonical unit value for this task recurrence duration."
                          },
                          "value": {
                            "maximum": 1000000,
                            "minimum": -1000000,
                            "type": "integer",
                            "description": "Canonical value represented by this field."
                          }
                        },
                        "required": [
                          "unit",
                          "value"
                        ],
                        "type": "object",
                        "description": "The planned start offset associated with this task recurrence transform."
                      }
                    },
                    "required": [
                      "op"
                    ],
                    "type": "object"
                  }
                ],
                "description": "Public API representation of task recurrence transform."
              },
              "maxItems": 64,
              "type": "array",
              "description": "The transforms associated with this task recurrence policy."
            }
          },
          "required": [
            "candidates",
            "conditions",
            "engineVersion",
            "limits",
            "materialization",
            "schemaVersion",
            "timeBasis",
            "transforms"
          ],
          "type": "object"
        },
        "sourceTaskId": {
          "maxLength": 128,
          "minLength": 1,
          "type": "string",
          "description": "The source task id associated with this task recurrence."
        },
        "template": {
          "additionalProperties": false,
          "description": "The template associated with this task recurrence.",
          "properties": {
            "billable": {
              "type": "boolean",
              "description": "Whether this time or service can be billed."
            },
            "contactId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related contact."
            },
            "customFieldValues": {
              "additionalProperties": {
                "oneOf": [
                  {
                    "type": [
                      "boolean",
                      "number",
                      "string",
                      "null"
                    ]
                  },
                  {
                    "items": {
                      "type": [
                        "boolean",
                        "number",
                        "string",
                        "null"
                      ]
                    },
                    "maxItems": 250,
                    "type": "array"
                  }
                ]
              },
              "maxProperties": 256,
              "type": "object",
              "description": "The custom field values associated with this task recurrence template."
            },
            "description": {
              "maxLength": 200000,
              "type": "string",
              "description": "Human-readable description of the resource."
            },
            "descriptionFormat": {
              "enum": [
                "markdown-v1",
                "plain-text"
              ],
              "type": "string",
              "description": "How to interpret the task description. Legacy and unmarked descriptions are plain-text; markdown-v1 enables TeamGrid Markdown."
            },
            "groupId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related workspace group."
            },
            "listId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related task list."
            },
            "name": {
              "maxLength": 1000,
              "minLength": 1,
              "type": "string",
              "description": "Human-readable name of the resource."
            },
            "personalListId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The personal list id associated with this task recurrence template."
            },
            "plannedTime": {
              "maximum": 100000000,
              "minimum": 0,
              "type": "number",
              "description": "Planned effort in minutes."
            },
            "projectId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related project."
            },
            "serviceId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related service."
            },
            "subscriberIds": {
              "items": {
                "maxLength": 256,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string"
              },
              "maxItems": 250,
              "type": "array",
              "description": "Ordered set of subscriber identifiers associated with this task recurrence template."
            },
            "subTasks": {
              "items": {
                "additionalProperties": false,
                "properties": {
                  "order": {
                    "maximum": 100000000,
                    "minimum": -100000000,
                    "type": "number",
                    "description": "The order associated with this task recurrence template sub tasks."
                  },
                  "title": {
                    "maxLength": 5000,
                    "minLength": 1,
                    "type": "string",
                    "description": "Human-readable title of the resource."
                  }
                },
                "required": [
                  "title"
                ],
                "type": "object"
              },
              "maxItems": 500,
              "type": "array",
              "description": "The sub tasks associated with this task recurrence template."
            },
            "tagIds": {
              "items": {
                "maxLength": 256,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string"
              },
              "maxItems": 250,
              "type": "array",
              "description": "Ordered set of tag identifiers associated with this task recurrence template."
            },
            "userId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related workspace user."
            }
          },
          "required": [
            "name"
          ],
          "type": "object"
        },
        "templatePatch": {
          "additionalProperties": false,
          "properties": {
            "billable": {
              "type": "boolean",
              "description": "Whether this time or service can be billed."
            },
            "contactId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related contact."
            },
            "customFieldValues": {
              "additionalProperties": {
                "oneOf": [
                  {
                    "type": [
                      "boolean",
                      "number",
                      "string",
                      "null"
                    ]
                  },
                  {
                    "items": {
                      "type": [
                        "boolean",
                        "number",
                        "string",
                        "null"
                      ]
                    },
                    "maxItems": 250,
                    "type": "array"
                  }
                ]
              },
              "maxProperties": 256,
              "type": "object",
              "description": "The custom field values associated with this task recurrence template patch."
            },
            "description": {
              "maxLength": 200000,
              "type": "string",
              "description": "Human-readable description of the resource."
            },
            "descriptionFormat": {
              "enum": [
                "markdown-v1",
                "plain-text"
              ],
              "type": "string",
              "description": "How to interpret the task description. Legacy and unmarked descriptions are plain-text; markdown-v1 enables TeamGrid Markdown."
            },
            "groupId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related workspace group."
            },
            "listId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related task list."
            },
            "name": {
              "maxLength": 1000,
              "minLength": 1,
              "type": "string",
              "description": "Human-readable name of the resource."
            },
            "personalListId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The personal list id associated with this task recurrence template patch."
            },
            "plannedTime": {
              "maximum": 100000000,
              "minimum": 0,
              "type": "number",
              "description": "Planned effort in minutes."
            },
            "projectId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related project."
            },
            "serviceId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related service."
            },
            "subscriberIds": {
              "items": {
                "maxLength": 256,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string"
              },
              "maxItems": 250,
              "type": "array",
              "description": "Ordered set of subscriber identifiers associated with this task recurrence template patch."
            },
            "subTasks": {
              "items": {
                "additionalProperties": false,
                "properties": {
                  "order": {
                    "maximum": 100000000,
                    "minimum": -100000000,
                    "type": "number",
                    "description": "The order associated with this task recurrence template patch sub tasks."
                  },
                  "title": {
                    "maxLength": 5000,
                    "minLength": 1,
                    "type": "string",
                    "description": "Human-readable title of the resource."
                  }
                },
                "required": [
                  "title"
                ],
                "type": "object"
              },
              "maxItems": 500,
              "type": "array",
              "description": "The sub tasks associated with this task recurrence template patch."
            },
            "tagIds": {
              "items": {
                "maxLength": 256,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string"
              },
              "maxItems": 250,
              "type": "array",
              "description": "Ordered set of tag identifiers associated with this task recurrence template patch."
            },
            "userId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related workspace user."
            }
          },
          "type": "object",
          "description": "The template patch associated with this task recurrence."
        }
      },
      "required": [
        "policy"
      ],
      "type": "object",
      "description": "Public API representation of task recurrence."
    }
  },
  "required": [
    "workspaceId",
    "idempotencyKey",
    "data"
  ],
  "additionalProperties": false,
  "$defs": {
    "TaskRecurrenceCandidateSource": {
      "oneOf": [
        {
          "additionalProperties": false,
          "properties": {
            "nodeId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The node id associated with this task recurrence candidate source."
            },
            "op": {
              "const": "calendarRule",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "rule": {
              "additionalProperties": false,
              "properties": {
                "byHour": {
                  "items": {
                    "maximum": 23,
                    "minimum": 0,
                    "type": "integer"
                  },
                  "maxItems": 24,
                  "type": "array",
                  "description": "The by hour associated with this task recurrence calendar rule."
                },
                "byMinute": {
                  "items": {
                    "maximum": 59,
                    "minimum": 0,
                    "type": "integer"
                  },
                  "maxItems": 60,
                  "type": "array",
                  "description": "The by minute associated with this task recurrence calendar rule."
                },
                "byMonth": {
                  "items": {
                    "maximum": 12,
                    "minimum": 1,
                    "type": "integer"
                  },
                  "maxItems": 12,
                  "type": "array",
                  "description": "The by month associated with this task recurrence calendar rule."
                },
                "byMonthDay": {
                  "items": {
                    "maximum": 31,
                    "minimum": -31,
                    "not": {
                      "const": 0
                    },
                    "type": "integer"
                  },
                  "maxItems": 62,
                  "type": "array",
                  "description": "The by month day associated with this task recurrence calendar rule."
                },
                "bySetPosition": {
                  "items": {
                    "maximum": 366,
                    "minimum": -366,
                    "not": {
                      "const": 0
                    },
                    "type": "integer"
                  },
                  "maxItems": 732,
                  "type": "array",
                  "description": "The by set position associated with this task recurrence calendar rule."
                },
                "byWeekDay": {
                  "items": {
                    "maximum": 6,
                    "minimum": 0,
                    "type": "integer"
                  },
                  "maxItems": 7,
                  "type": "array",
                  "description": "The by week day associated with this task recurrence calendar rule."
                },
                "frequency": {
                  "enum": [
                    "minutely",
                    "hourly",
                    "daily",
                    "weekly",
                    "monthly",
                    "yearly"
                  ],
                  "type": "string",
                  "description": "Canonical frequency value for this task recurrence calendar rule."
                },
                "interval": {
                  "default": 1,
                  "maximum": 1000000,
                  "minimum": 1,
                  "type": "integer",
                  "description": "The interval associated with this task recurrence calendar rule."
                },
                "invalidDayHandling": {
                  "enum": [
                    "next-valid-day",
                    "omit",
                    "previous-valid-day"
                  ],
                  "type": "string",
                  "description": "Canonical invalid day handling value for this task recurrence calendar rule."
                },
                "startLocal": {
                  "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?$",
                  "type": "string",
                  "description": "The start local associated with this task recurrence calendar rule."
                },
                "weekStart": {
                  "maximum": 6,
                  "minimum": 0,
                  "type": "integer",
                  "description": "The week start associated with this task recurrence calendar rule."
                }
              },
              "required": [
                "frequency",
                "startLocal"
              ],
              "type": "object",
              "description": "The rule associated with this task recurrence candidate source."
            }
          },
          "required": [
            "nodeId",
            "op",
            "rule"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "nodeId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The node id associated with this task recurrence candidate source."
            },
            "op": {
              "const": "dateSet",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "dates": {
              "items": {
                "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?$",
                "type": "string"
              },
              "maxItems": 500,
              "minItems": 1,
              "type": "array",
              "description": "The dates associated with this task recurrence candidate source."
            }
          },
          "required": [
            "nodeId",
            "op",
            "dates"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "nodeId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The node id associated with this task recurrence candidate source."
            },
            "op": {
              "const": "monthSet",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "months": {
              "items": {
                "maximum": 12,
                "minimum": 1,
                "type": "integer"
              },
              "maxItems": 12,
              "minItems": 1,
              "type": "array",
              "description": "The months associated with this task recurrence candidate source."
            }
          },
          "required": [
            "nodeId",
            "op",
            "months"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "nodeId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The node id associated with this task recurrence candidate source."
            },
            "op": {
              "const": "sequence",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "anchorLocal": {
              "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?$",
              "type": "string",
              "description": "The anchor local associated with this task recurrence candidate source."
            },
            "intervals": {
              "items": {
                "allOf": [
                  {
                    "additionalProperties": false,
                    "allOf": [
                      {
                        "if": {
                          "properties": {
                            "unit": {
                              "const": "business-day"
                            }
                          },
                          "required": [
                            "unit"
                          ]
                        },
                        "then": {
                          "properties": {
                            "value": {
                              "maximum": 10000,
                              "minimum": -10000,
                              "type": "integer"
                            }
                          }
                        }
                      }
                    ],
                    "properties": {
                      "unit": {
                        "enum": [
                          "minute",
                          "hour",
                          "day",
                          "week",
                          "month",
                          "year",
                          "business-day"
                        ],
                        "type": "string",
                        "description": "Canonical unit value for this task recurrence duration."
                      },
                      "value": {
                        "maximum": 1000000,
                        "minimum": -1000000,
                        "type": "integer",
                        "description": "Canonical value represented by this field."
                      }
                    },
                    "required": [
                      "unit",
                      "value"
                    ],
                    "type": "object",
                    "description": "Public API representation of task recurrence duration."
                  },
                  {
                    "properties": {
                      "value": {
                        "minimum": 0,
                        "type": "integer",
                        "description": "Canonical value represented by this field."
                      }
                    },
                    "type": "object"
                  }
                ]
              },
              "maxItems": 500,
              "minItems": 1,
              "type": "array",
              "description": "The intervals associated with this task recurrence candidate source."
            }
          },
          "required": [
            "nodeId",
            "op",
            "anchorLocal",
            "intervals"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "nodeId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The node id associated with this task recurrence candidate source."
            },
            "op": {
              "const": "afterOccurrenceEvent",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "completionMode": {
              "enum": [
                "every-completion-transition",
                "first-completion-only"
              ],
              "type": "string",
              "description": "Canonical completion mode value for this task recurrence candidate source."
            },
            "delay": {
              "allOf": [
                {
                  "additionalProperties": false,
                  "allOf": [
                    {
                      "if": {
                        "properties": {
                          "unit": {
                            "const": "business-day"
                          }
                        },
                        "required": [
                          "unit"
                        ]
                      },
                      "then": {
                        "properties": {
                          "value": {
                            "maximum": 10000,
                            "minimum": -10000,
                            "type": "integer"
                          }
                        }
                      }
                    }
                  ],
                  "properties": {
                    "unit": {
                      "enum": [
                        "minute",
                        "hour",
                        "day",
                        "week",
                        "month",
                        "year",
                        "business-day"
                      ],
                      "type": "string",
                      "description": "Canonical unit value for this task recurrence duration."
                    },
                    "value": {
                      "maximum": 1000000,
                      "minimum": -1000000,
                      "type": "integer",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "required": [
                    "unit",
                    "value"
                  ],
                  "type": "object",
                  "description": "Public API representation of task recurrence duration."
                },
                {
                  "properties": {
                    "value": {
                      "minimum": 0,
                      "type": "integer",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "type": "object"
                }
              ],
              "description": "The delay associated with this task recurrence candidate source."
            },
            "event": {
              "enum": [
                "completed",
                "created",
                "reopened"
              ],
              "type": "string",
              "description": "Canonical TeamGrid event name."
            }
          },
          "required": [
            "nodeId",
            "op",
            "event"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "nodeId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The node id associated with this task recurrence candidate source."
            },
            "op": {
              "const": "afterProjectEvent",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "delay": {
              "allOf": [
                {
                  "additionalProperties": false,
                  "allOf": [
                    {
                      "if": {
                        "properties": {
                          "unit": {
                            "const": "business-day"
                          }
                        },
                        "required": [
                          "unit"
                        ]
                      },
                      "then": {
                        "properties": {
                          "value": {
                            "maximum": 10000,
                            "minimum": -10000,
                            "type": "integer"
                          }
                        }
                      }
                    }
                  ],
                  "properties": {
                    "unit": {
                      "enum": [
                        "minute",
                        "hour",
                        "day",
                        "week",
                        "month",
                        "year",
                        "business-day"
                      ],
                      "type": "string",
                      "description": "Canonical unit value for this task recurrence duration."
                    },
                    "value": {
                      "maximum": 1000000,
                      "minimum": -1000000,
                      "type": "integer",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "required": [
                    "unit",
                    "value"
                  ],
                  "type": "object",
                  "description": "Public API representation of task recurrence duration."
                },
                {
                  "properties": {
                    "value": {
                      "minimum": 0,
                      "type": "integer",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "type": "object"
                }
              ],
              "description": "The delay associated with this task recurrence candidate source."
            },
            "event": {
              "enum": [
                "archived",
                "completed",
                "created",
                "reopened",
                "restored"
              ],
              "type": "string",
              "description": "Canonical TeamGrid event name."
            },
            "projectId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related project."
            }
          },
          "required": [
            "nodeId",
            "op",
            "event",
            "projectId"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "nodeId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The node id associated with this task recurrence candidate source."
            },
            "op": {
              "const": "externalEvent",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "delay": {
              "allOf": [
                {
                  "additionalProperties": false,
                  "allOf": [
                    {
                      "if": {
                        "properties": {
                          "unit": {
                            "const": "business-day"
                          }
                        },
                        "required": [
                          "unit"
                        ]
                      },
                      "then": {
                        "properties": {
                          "value": {
                            "maximum": 10000,
                            "minimum": -10000,
                            "type": "integer"
                          }
                        }
                      }
                    }
                  ],
                  "properties": {
                    "unit": {
                      "enum": [
                        "minute",
                        "hour",
                        "day",
                        "week",
                        "month",
                        "year",
                        "business-day"
                      ],
                      "type": "string",
                      "description": "Canonical unit value for this task recurrence duration."
                    },
                    "value": {
                      "maximum": 1000000,
                      "minimum": -1000000,
                      "type": "integer",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "required": [
                    "unit",
                    "value"
                  ],
                  "type": "object",
                  "description": "Public API representation of task recurrence duration."
                },
                {
                  "properties": {
                    "value": {
                      "minimum": 0,
                      "type": "integer",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "type": "object"
                }
              ],
              "description": "The delay associated with this task recurrence candidate source."
            },
            "eventType": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z][A-Za-z0-9_.:-]{0,127}$",
              "type": "string",
              "description": "The event type associated with this task recurrence candidate source."
            },
            "sourceId": {
              "maxLength": 128,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The source id associated with this task recurrence candidate source."
            }
          },
          "required": [
            "nodeId",
            "op",
            "eventType"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "union",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "sources": {
              "items": {
                "$ref": "#/$defs/TaskRecurrenceCandidateSource"
              },
              "maxItems": 32,
              "minItems": 1,
              "type": "array",
              "description": "The sources associated with this task recurrence candidate source."
            }
          },
          "required": [
            "op",
            "sources"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "intersection",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "sources": {
              "items": {
                "$ref": "#/$defs/TaskRecurrenceCandidateSource"
              },
              "maxItems": 32,
              "minItems": 1,
              "type": "array",
              "description": "The sources associated with this task recurrence candidate source."
            }
          },
          "required": [
            "op",
            "sources"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "difference",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "exclude": {
              "$ref": "#/$defs/TaskRecurrenceCandidateSource"
            },
            "include": {
              "$ref": "#/$defs/TaskRecurrenceCandidateSource"
            }
          },
          "required": [
            "op",
            "exclude",
            "include"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "deduplicate",
              "type": "string",
              "description": "The op associated with this task recurrence candidate source."
            },
            "granularity": {
              "enum": [
                "instant",
                "day",
                "minute"
              ],
              "type": "string",
              "description": "Canonical granularity value for this task recurrence candidate source."
            },
            "source": {
              "$ref": "#/$defs/TaskRecurrenceCandidateSource"
            }
          },
          "required": [
            "op",
            "granularity",
            "source"
          ],
          "type": "object"
        }
      ],
      "description": "Public API representation of task recurrence candidate source."
    },
    "TaskRecurrenceCondition": {
      "oneOf": [
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "all",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "conditions": {
              "items": {
                "$ref": "#/$defs/TaskRecurrenceCondition"
              },
              "maxItems": 64,
              "type": "array",
              "description": "The conditions associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "conditions"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "any",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "conditions": {
              "items": {
                "$ref": "#/$defs/TaskRecurrenceCondition"
              },
              "maxItems": 64,
              "type": "array",
              "description": "The conditions associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "conditions"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "not",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "condition": {
              "$ref": "#/$defs/TaskRecurrenceCondition"
            }
          },
          "required": [
            "op",
            "condition"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "exists",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "value": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "Canonical value represented by this field."
            }
          },
          "required": [
            "op",
            "value"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "eq",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "left": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The left associated with this task recurrence condition."
            },
            "right": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The right associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "left",
            "right"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "neq",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "left": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The left associated with this task recurrence condition."
            },
            "right": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The right associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "left",
            "right"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "lt",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "left": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The left associated with this task recurrence condition."
            },
            "right": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The right associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "left",
            "right"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "lte",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "left": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The left associated with this task recurrence condition."
            },
            "right": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The right associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "left",
            "right"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "gt",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "left": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The left associated with this task recurrence condition."
            },
            "right": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The right associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "left",
            "right"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "gte",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "left": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The left associated with this task recurrence condition."
            },
            "right": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The right associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "left",
            "right"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "op": {
              "const": "in",
              "type": "string",
              "description": "The op associated with this task recurrence condition."
            },
            "left": {
              "oneOf": [
                {
                  "type": [
                    "boolean",
                    "number",
                    "string",
                    "null"
                  ]
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "ref": {
                      "maxLength": 256,
                      "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                      "type": "string",
                      "description": "The ref associated with this task recurrence condition value."
                    }
                  },
                  "required": [
                    "ref"
                  ],
                  "type": "object"
                }
              ],
              "description": "The left associated with this task recurrence condition."
            },
            "right": {
              "items": {
                "oneOf": [
                  {
                    "type": [
                      "boolean",
                      "number",
                      "string",
                      "null"
                    ]
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "ref": {
                        "maxLength": 256,
                        "pattern": "^(event\\.[A-Za-z0-9_.:-]+|occurrence\\.(scheduledFor|scheduledDate)|previousOccurrence\\.(archived|completed|exists|state)|project\\.(active|archived|completed|exists)|series\\.(status|occurrenceCount)|customField\\.[A-Za-z0-9_.:-]+)$",
                        "type": "string",
                        "description": "The ref associated with this task recurrence condition value."
                      }
                    },
                    "required": [
                      "ref"
                    ],
                    "type": "object"
                  }
                ],
                "description": "Public API representation of task recurrence condition value."
              },
              "maxItems": 100,
              "type": "array",
              "description": "The right associated with this task recurrence condition."
            }
          },
          "required": [
            "op",
            "left",
            "right"
          ],
          "type": "object"
        }
      ],
      "description": "Public API representation of task recurrence condition."
    }
  }
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scope: `task-recurrences:write`, `tasks:read`, `tasks:write`.

- [`createTaskRecurrence`](/api/v1/reference/operations/createtaskrecurrence/) — `POST /task-recurrences`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Output and limits

A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

The linked API operation is the canonical reference for the response envelope and resource schema.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**workspace-mutation:** This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_task_recurrence_create operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `task-recurrences:write` or `tasks:read` or `tasks:write` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
