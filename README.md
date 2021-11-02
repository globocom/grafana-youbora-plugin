# Grafana Data Source Plugin for NPAW's Youbora

[![Build](https://github.com/nedmax/grafana-youbora-plugin/workflows/CI/badge.svg)](https://github.com/nedmax/grafana-youbora-plugin/actions?query=workflow%3A%22CI%22)

This plugin enables Youbora API as a data source for Grafana.

## Getting started

### Dependencies

- Docker
- Grafana >=7.0
- NodeJS >=14
- yarn

1. Install dependencies

   ```bash
   make setup
   ```

2. Build plugin in development mode and run

   ```bash
   make run
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Grafana Plugin Development

- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System

## Youbora API

- [Analytics API](https://documentation.npaw.com/npaw-integration/reference/about-analytics-api)

## TODO
- Use backend datasource proxy and encrypted key