{{/*
Expand the name of the chart.
*/}}
{{- define "enabler.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "enabler.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "enabler.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Name of the component apiamd64.
*/}}
{{- define "apiamd64.name" -}}
{{- printf "%s-api-amd64" (include "enabler.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}
{{/*
Name of the component apiarm64.
*/}}
{{- define "apiarm64.name" -}}
{{- printf "%s-api-arm64" (include "enabler.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified component apiamd64 name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "apiamd64.fullname" -}}
{{- printf "%s-api-amd64" (include "enabler.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}
{{/*
Create a default fully qualified component apiarm64 name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "apiarm64.fullname" -}}
{{- printf "%s-api-arm64" (include "enabler.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Component apiamd64 labels.
*/}}
{{- define "apiamd64.labels" -}}
helm.sh/chart: {{ include "enabler.chart" . }}
{{ include "apiamd64.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
{{/*
Component apiarm64 labels.
*/}}
{{- define "apiarm64.labels" -}}
helm.sh/chart: {{ include "enabler.chart" . }}
{{ include "apiarm64.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Component apiamd64 selector labels.
*/}}
{{- define "apiamd64.selectorLabels" -}}
app.kubernetes.io/name: {{ include "enabler.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
enabler: {{ .Chart.Name }}
app.kubernetes.io/component: api-amd64
isMainInterface: "yes"
tier: {{ .Values.apiamd64.tier }}
{{- end }}
{{/*
Component apiarm64 selector labels.
*/}}
{{- define "apiarm64.selectorLabels" -}}
app.kubernetes.io/name: {{ include "enabler.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
enabler: {{ .Chart.Name }}
app.kubernetes.io/component: api-arm64
isMainInterface: "yes"
tier: {{ .Values.apiarm64.tier }}
{{- end }}

