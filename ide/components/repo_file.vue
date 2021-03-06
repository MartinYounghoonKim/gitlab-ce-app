<script>
  import { mapState } from 'vuex';
  import timeAgoMixin from '../../vue_shared/mixins/timeago';
  import skeletonLoadingContainer from '../../vue_shared/components/skeleton_loading_container.vue';
  import newDropdown from './new_dropdown/index.vue';

  export default {
    mixins: [
      timeAgoMixin,
    ],
    components: {
      skeletonLoadingContainer,
      newDropdown,
    },
    props: {
      file: {
        type: Object,
        required: true,
      },
      showExtraColumns: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState([
        'leftPanelCollapsed',
      ]),
      fileIcon() {
        return {
          'fa-spinner fa-spin': this.file.loading,
          [this.file.icon]: !this.file.loading,
          'fa-folder-open': !this.file.loading && this.file.opened,
        };
      },
      isSubmodule() {
        return this.file.type === 'submodule';
      },
      isTree() {
        return this.file.type === 'tree';
      },
      levelIndentation() {
        return {
          marginLeft: `${this.file.level * 16}px`,
        };
      },
      shortId() {
        return this.file.id.substr(0, 8);
      },
      submoduleColSpan() {
        return !this.leftPanelCollapsed && this.isSubmodule ? 3 : 1;
      },
      fileClass() {
        if (this.file.type === 'blob') {
          if (this.file.active) {
            return 'file-open file-active';
          }
          return this.file.opened ? 'file-open' : '';
        }
        return '';
      },
      changedClass() {
        return {
          'fa-circle unsaved-icon': this.file.changed || this.file.tempFile,
        };
      },
    },
    methods: {
      clickFile(row) {
        // Manual Action if a tree is selected/opened
        if (this.file.type === 'tree' && this.$router.currentRoute.path === `/project${row.url}`) {
          this.$store.dispatch('toggleTreeOpen', {
            endpoint: this.file.url,
            tree: this.file,
          });
        }
        this.$router.push(`/project${row.url}`);
      },
    },
    updated() {
      if (this.file.type === 'blob' && this.file.active) {
        this.$el.scrollIntoView();
      }
    },
  };
</script>

<template>
  <tr
    class="file"
    :class="fileClass"
    @click="clickFile(file)">
    <td
      class="multi-file-table-name"
      :colspan="submoduleColSpan"
    >
      <i
        class="fa fa-fw file-icon"
        :class="fileIcon"
        :style="levelIndentation"
        aria-hidden="true"
      >
      </i>
      <a
        class="repo-file-name"
      >
        {{ file.name }}
      </a>
      <new-dropdown
        v-if="isTree"
        :project-id="file.projectId"
        :branch="file.branchId"
        :path="file.path"
        :parent="file"/>
      <i
        class="fa"
        v-if="changedClass"
        :class="changedClass"
        aria-hidden="true"
      >
      </i>
      <template v-if="isSubmodule && file.id">
        @
        <span class="commit-sha">
          <a
            @click.stop
            :href="file.tree_url"
          >
            {{ shortId }}
          </a>
        </span>
      </template>
    </td>

    <template v-if="showExtraColumns && !isSubmodule">
      <td class="multi-file-table-col-commit-message hidden-sm hidden-xs">
        <a
          v-if="file.lastCommit.message"
          @click.stop
          :href="file.lastCommit.url"
        >
          {{ file.lastCommit.message }}
        </a>
        <skeleton-loading-container
          v-else
          :small="true"
        />
      </td>

      <td class="commit-update hidden-xs text-right">
        <span
          v-if="file.lastCommit.updatedAt"
          :title="tooltipTitle(file.lastCommit.updatedAt)"
        >
          {{ timeFormated(file.lastCommit.updatedAt) }}
        </span>
        <skeleton-loading-container
          v-else
          class="animation-container-right"
          :small="true"
        />
      </td>
    </template>
  </tr>
</template>
