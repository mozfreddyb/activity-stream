const React = require("react");
const {connect} = require("react-redux");
const {FormattedMessage} = require("react-intl");

const TopSitesEdit = require("./TopSitesEdit");
const {TopSiteList} = require("./TopSite");
const CollapsibleSection = require("content-src/components/CollapsibleSection/CollapsibleSection");
const ComponentPerfTimer = require("content-src/components/ComponentPerfTimer/ComponentPerfTimer");
const {actionCreators: ac, actionTypes: at} = require("common/Actions.jsm");
const {MIN_RICH_FAVICON_SIZE, MIN_CORNER_FAVICON_SIZE} = require("./TopSitesConstants");

/**
 * Iterates through TopSites and counts types of images.
 * @param acc Accumulator for reducer.
 * @param topsite Entry in TopSites.
 */
function countTopSitesIconsTypes(topSites) {
  const countTopSitesTypes = (acc, link) => {
    if (link.tippyTopIcon || link.faviconRef === "tippytop") {
      acc.tippytop++;
    } else if (link.faviconSize >= MIN_RICH_FAVICON_SIZE) {
      acc.rich_icon++;
    } else if (link.screenshot && link.faviconSize >= MIN_CORNER_FAVICON_SIZE) {
      acc.screenshot_with_icon++;
    } else if (link.screenshot) {
      acc.screenshot++;
    } else {
      acc.no_image++;
    }

    return acc;
  };

  return topSites.reduce(countTopSitesTypes, {
    "screenshot_with_icon": 0,
    "screenshot": 0,
    "tippytop": 0,
    "rich_icon": 0,
    "no_image": 0
  });
}

class TopSites extends React.PureComponent {
  /**
   * Dispatch session statistics about the quality of TopSites icons.
   */
  _dispatchTopSitesIconStats() {
    const topSitesIconsStats = countTopSitesIconsTypes(this._getTopSites());
    // Dispatch telemetry event with the count of TopSites images types.
    this.props.dispatch(ac.SendToMain({
      type: at.SAVE_SESSION_PERF_DATA,
      data: {topsites_icon_stats: topSitesIconsStats}
    }));
  }

  /**
   * Return the TopSites to display based on prefs.
   */
  _getTopSites() {
    return this.props.TopSites.rows.slice(0, this.props.TopSitesCount);
  }

  componentDidUpdate() {
    this._dispatchTopSitesIconStats();
  }

  componentDidMount() {
    this._dispatchTopSitesIconStats();
  }

  render() {
    const props = this.props;
    const infoOption = {
      header: {id: "settings_pane_topsites_header"},
      body: {id: "settings_pane_topsites_body"}
    };
    return (<ComponentPerfTimer id="topsites" initialized={props.TopSites.initialized} dispatch={props.dispatch}>
      <CollapsibleSection className="top-sites" icon="topsites" title={<FormattedMessage id="header_top_sites" />} infoOption={infoOption} prefName="collapseTopSites" Prefs={props.Prefs} dispatch={props.dispatch}>
        <TopSiteList TopSites={props.TopSites} TopSitesCount={props.TopSitesCount} dispatch={props.dispatch} intl={props.intl} />
        <TopSitesEdit {...props} />
      </CollapsibleSection>
    </ComponentPerfTimer>);
  }
}

module.exports = connect(state => ({TopSites: state.TopSites, Prefs: state.Prefs, TopSitesCount: state.Prefs.values.topSitesCount}))(TopSites);
module.exports._unconnected = TopSites;
