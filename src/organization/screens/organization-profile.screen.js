import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { StyleSheet, RefreshControl } from 'react-native';
import { ListItem } from 'react-native-elements';
import { createStructuredSelector } from 'reselect';
import {
  getAuthLanguage,
} from 'auth';
import {
  ViewContainer,
  UserProfile,
  LoadingMembersList,
  MembersList,
  SectionList,
  ParallaxScroll,
  EntityInfo,
} from 'components';
import {
  emojifyText,
  translate,
} from 'utils';
import { colors, fonts } from 'config';
import {
  getOrg,
  getOrgRepos,
  getOrgMembers,
  // Selectors
  getOrganization,
  getOrganizationRepositories,
  getOrganizationMembers,
  getOrganizationIsPendingOrg,
  getOrganizationIsPendingRepos,
  getOrganizationIsPendingMembers,
} from '../index';

const selectors = createStructuredSelector({
  organization: getOrganization,
  repositories: getOrganizationRepositories,
  members: getOrganizationMembers,
  isPendingOrg: getOrganizationIsPendingOrg,
  isPendingRepos: getOrganizationIsPendingRepos,
  isPendingMembers: getOrganizationIsPendingMembers,
  language: getAuthLanguage,
});

const actionCreators = {
  getOrg,
  getOrgRepos,
  getOrgMembers,
};

const actions = dispatch => bindActionCreators(actionCreators, dispatch);

const mapDispatchToProps = dispatch => ({
  getOrgByDispatch: orgName => dispatch(getOrg(orgName)),
  getOrgReposByDispatch: url => dispatch(getOrgRepos(url)),
  getOrgMembersByDispatch: orgName => dispatch(getOrgMembers(orgName)),
});

const styles = StyleSheet.create({
  listTitle: {
    color: colors.black,
    ...fonts.fontPrimary,
  },
  listSubTitle: {
    color: colors.greyDark,
    ...fonts.fontPrimary,
  },
});

class OrganizationProfile extends Component {
  props: {
    getOrgByDispatch: Function,
    // getOrgReposByDispatch: Function,
    getOrgMembersByDispatch: Function,
    organization: Object,
    // repositories: Array,
    members: Array,
    isPendingOrg: boolean,
    // isPendingRepos: boolean,
    isPendingMembers: boolean,
    navigation: Object,
    language: string,
  };

  state: {
    refreshing: boolean,
  };

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    const organization = this.props.navigation.state.params.organization;

    this.props.getOrgByDispatch(organization.login);
    this.props.getOrgMembersByDispatch(organization.login);
  }

  getOrgData = () => {
    const organization = this.props.navigation.state.params.organization;

    this.setState({ refreshing: true });
    Promise.all(
      this.props.getOrgByDispatch(organization.login),
      this.props.getOrgMembersByDispatch(organization.login)
    ).then(() => {
      this.setState({ refreshing: false });
    });
  };

  render() {
    const {
      organization,
      members,
      isPendingOrg,
      isPendingMembers,
      navigation,
      language,
    } = this.props;
    const { refreshing } = this.state;
    const initialOrganization = this.props.navigation.state.params.organization;

    return (
      <ViewContainer>
        <ParallaxScroll
          renderContent={() =>
            <UserProfile
              type="org"
              initialUser={initialOrganization}
              user={
                initialOrganization.login === organization.login
                  ? organization
                  : initialOrganization
              }
              navigation={navigation}
            />}
          refreshControl={
            <RefreshControl
              onRefresh={this.getOrgData}
              refreshing={refreshing}
            />
          }
          stickyTitle={organization.name}
          navigateBack
          navigation={navigation}
        >
          {isPendingMembers &&
            <LoadingMembersList
              title={translate('organization.main.membersTitle', language)}
            />}

          {!isPendingMembers &&
            <MembersList
              title={translate('organization.main.membersTitle', language)}
              members={members}
              navigation={navigation}
            />}

          {!!organization.description &&
            organization.description !== '' &&
            <SectionList
              title={translate('organization.main.descriptionTitle', language)}
            >
              <ListItem
                subtitle={emojifyText(organization.description)}
                subtitleStyle={styles.listSubTitle}
                hideChevron
              />
            </SectionList>}

          {!isPendingOrg &&
            <EntityInfo entity={organization} navigation={navigation} />}
        </ParallaxScroll>
      </ViewContainer>
    );
  }
}

export const OrganizationProfileScreen = connect(
  selectors,
  actions
)(OrganizationProfile);
